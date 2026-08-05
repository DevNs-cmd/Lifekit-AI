"""
Mocked end-to-end test suite for the LifeKit AI Service.
No real OpenAI / Qdrant / Redis needed — LLM calls and vector store calls
are patched with fakes that return realistic JSON, so we can verify the
WIRING (does data flow correctly node -> node -> node) rather than the
actual AI quality (which needs real API keys).
"""
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

results = []


def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    results.append((name, status, detail))
    print(f"[{status}] {name}" + (f" - {detail}" if detail and status == 'FAIL' else ""))


# ---------------------------------------------------------------------------
# Fake LLM: returns canned JSON depending on which module called it
# ---------------------------------------------------------------------------
class FakeLLMResponse:
    def __init__(self, content):
        self.content = content


def make_fake_llm(content_by_call):
    """content_by_call: list of JSON strings returned in sequence per .ainvoke() call"""
    call_iter = iter(content_by_call)

    async def fake_ainvoke(prompt):
        try:
            content = next(call_iter)
        except StopIteration:
            content = "{}"
        return FakeLLMResponse(content)

    fake = MagicMock()
    fake.ainvoke = fake_ainvoke
    return fake


# ---------------------------------------------------------------------------
# Fake Qdrant client
# ---------------------------------------------------------------------------
class FakeQdrantClient:
    def __init__(self):
        self.stored_points = []

    def get_collections(self):
        col = MagicMock()
        col.name = "life_memory"
        wrapper = MagicMock()
        wrapper.collections = [col]
        return wrapper

    def search(self, **kwargs):
        hit = MagicMock()
        hit.payload = {"text": "User previously said they want to switch careers into tech."}
        hit.score = 0.87
        return [hit]

    def upsert(self, **kwargs):
        self.stored_points.append(kwargs)
        return True


async def run_all_tests():
    print("=" * 70)
    print("1. UNIT TESTS — individual modules")
    print("=" * 70)

    # ---- Intent Understanding ----
    with patch("app.modules.intent.service.get_llm") as mock_get_llm:
        mock_get_llm.return_value = make_fake_llm([
            json.dumps({"intent": "career_switch", "domain": "career",
                        "confidence": 0.9, "goal_summary": "Switch career into tech"})
        ])
        from app.modules.intent.service import understand_intent
        result = await understand_intent("I want to switch my career into tech", [])
        check("Intent Understanding returns domain=career", result.get("domain") == "career", result)
        check("Intent Understanding returns confidence float", isinstance(result.get("confidence"), (int, float)), result)

    # ---- Life Mission Engine ----
    with patch("app.modules.mission.service.get_llm") as mock_get_llm:
        mock_get_llm.return_value = make_fake_llm([
            json.dumps({"aligned": True, "alignment_score": 0.8, "note": "Fits growth mission"})
        ])
        from app.modules.mission.service import align_with_mission
        result = await align_with_mission("Switch career into tech", "Grow professionally")
        check("Mission alignment returns aligned=True", result.get("aligned") is True, result)

    # ---- AI Life Planner ----
    with patch("app.modules.planner.service.get_llm") as mock_get_llm:
        mock_get_llm.return_value = make_fake_llm([
            json.dumps({"title": "Career Switch Plan",
                        "steps": [{"order": 1, "task": "Learn Python", "estimated_days": 30}],
                        "total_estimated_days": 30})
        ])
        from app.modules.planner.service import generate_plan
        result = await generate_plan("Switch career into tech", "career", "Fits growth mission")
        check("Planner returns non-empty steps", len(result.get("steps", [])) > 0, result)

    # ---- Domain Agents ----
    with patch("app.modules.domain_agents.base.get_llm") as mock_get_llm:
        mock_get_llm.return_value = make_fake_llm([
            json.dumps({"advice": "Start with fundamentals", "risks": ["burnout"], "resources": ["freeCodeCamp"]})
        ])
        from app.modules.domain_agents.agents import get_agent
        agent = get_agent("career")
        result = await agent.run("Switch career into tech", {"title": "Career Switch Plan"})
        check("Domain agent dispatch picks CareerAgent", agent.domain == "career", agent.domain)
        check("Domain agent returns advice", bool(result.get("advice")), result)

    # ---- Opportunity Discovery ----
    with patch("app.modules.opportunity.service.get_llm") as mock_get_llm:
        mock_get_llm.return_value = make_fake_llm([
            json.dumps([{"title": "freeCodeCamp", "type": "course", "why_relevant": "Free, structured"}])
        ])
        from app.modules.opportunity.service import discover_opportunities
        result = await discover_opportunities("career", "Switch career into tech")
        check("Opportunity discovery returns a list", isinstance(result, list) and len(result) > 0, result)

    # ---- Recommendation Engine ----
    with patch("app.modules.recommendation.service.get_llm") as mock_get_llm:
        mock_get_llm.return_value = make_fake_llm([
            json.dumps([{"title": "Start freeCodeCamp", "reason": "matches goal", "priority": 5}])
        ])
        from app.modules.recommendation.service import build_recommendations
        result = await build_recommendations({"advice": "x"}, [{"title": "freeCodeCamp"}], [])
        check("Recommendation engine returns ranked list", result[0]["priority"] == 5, result)

    # ---- Execution Intelligence ----
    with patch("app.modules.execution.service.get_llm") as mock_get_llm:
        mock_get_llm.return_value = make_fake_llm([
            json.dumps({"next_action": "Finish module 1", "check_in_frequency_days": 3, "motivation_note": "Keep going!"})
        ])
        from app.modules.execution.service import guide_execution
        result = await guide_execution({"title": "plan"}, [{"title": "rec"}])
        check("Execution intelligence returns next_action", bool(result.get("next_action")), result)

    # ---- Life Memory (Qdrant) ----
    fake_qdrant = FakeQdrantClient()
    with patch("app.modules.memory.service.get_qdrant", return_value=fake_qdrant), \
         patch("app.modules.memory.service._embed", new=AsyncMock(return_value=[0.01] * 1536)):
        from app.modules.memory.service import retrieve_relevant_memory, store_memory
        mem = await retrieve_relevant_memory("user_1", "career switch")
        check("Memory retrieval returns results", len(mem) > 0, mem)
        written = await store_memory("user_1", "User is switching careers to tech")
        check("Memory write succeeds", written is True, written)
        check("Memory write actually calls Qdrant upsert", len(fake_qdrant.stored_points) == 1, fake_qdrant.stored_points)

    print()
    print("=" * 70)
    print("2. FULL PIPELINE TEST — orchestrator graph, all 9 nodes end-to-end")
    print("=" * 70)

    fake_qdrant_2 = FakeQdrantClient()
    llm_responses = [
        json.dumps({"intent": "career_switch", "domain": "career", "confidence": 0.9,
                    "goal_summary": "Switch career into tech"}),                         # intent
        json.dumps({"aligned": True, "alignment_score": 0.8, "note": "Fits mission"}),    # mission
        json.dumps({"title": "Career Switch Plan", "steps": [{"order": 1, "task": "Learn Python", "estimated_days": 30}],
                    "total_estimated_days": 30}),                                         # planner
        json.dumps({"advice": "Start with fundamentals", "risks": [], "resources": []}),  # domain agent
        json.dumps([{"title": "freeCodeCamp", "type": "course", "why_relevant": "Free"}]),# opportunity
        json.dumps([{"title": "Start freeCodeCamp", "reason": "matches goal", "priority": 5}]),  # recommendation
        json.dumps({"next_action": "Finish module 1", "check_in_frequency_days": 3, "motivation_note": "Go!"}),  # execution
    ]

    with patch("app.modules.intent.service.get_llm", return_value=make_fake_llm([llm_responses[0]])), \
         patch("app.modules.mission.service.get_llm", return_value=make_fake_llm([llm_responses[1]])), \
         patch("app.modules.planner.service.get_llm", return_value=make_fake_llm([llm_responses[2]])), \
         patch("app.modules.domain_agents.base.get_llm", return_value=make_fake_llm([llm_responses[3]])), \
         patch("app.modules.opportunity.service.get_llm", return_value=make_fake_llm([llm_responses[4]])), \
         patch("app.modules.recommendation.service.get_llm", return_value=make_fake_llm([llm_responses[5]])), \
         patch("app.modules.execution.service.get_llm", return_value=make_fake_llm([llm_responses[6]])), \
         patch("app.modules.memory.service.get_qdrant", return_value=fake_qdrant_2), \
         patch("app.modules.memory.service._embed", new=AsyncMock(return_value=[0.01] * 1536)):

        from app.modules.orchestrator.graph import run_orchestration
        final_state = await run_orchestration(
            user_id="user_1",
            message="I want to switch my career into tech",
            session_id="sess_1",
            context={"life_mission": "Grow professionally"},
        )

        check("Pipeline: relevant_memory populated (node 1)", len(final_state.get("relevant_memory", [])) > 0)
        check("Pipeline: intent = career_switch (node 2)", final_state.get("intent") == "career_switch", final_state.get("intent"))
        check("Pipeline: domain = career (node 2)", final_state.get("domain") == "career")
        check("Pipeline: mission_alignment aligned (node 3)", final_state.get("mission_alignment", {}).get("aligned") is True)
        check("Pipeline: plan has steps (node 4)", len(final_state.get("plan", {}).get("steps", [])) > 0)
        check("Pipeline: domain_result has advice (node 5)", bool(final_state.get("domain_result", {}).get("advice")))
        check("Pipeline: opportunities populated (node 6)", len(final_state.get("opportunities", [])) > 0)
        check("Pipeline: recommendations populated (node 7)", len(final_state.get("recommendations", [])) > 0)
        check("Pipeline: execution_guidance has next_action (node 8)", bool(final_state.get("execution_guidance", {}).get("next_action")))
        check("Pipeline: memory_written = True (node 9)", final_state.get("memory_written") is True)
        check("Pipeline: memory actually persisted to Qdrant", len(fake_qdrant_2.stored_points) == 1)

    print()
    print("=" * 70)
    print("3. API ENDPOINT TEST — via FastAPI TestClient (HTTP layer)")
    print("=" * 70)

    fake_qdrant_3 = FakeQdrantClient()
    with patch("app.modules.intent.service.get_llm", return_value=make_fake_llm([llm_responses[0]])), \
         patch("app.modules.mission.service.get_llm", return_value=make_fake_llm([llm_responses[1]])), \
         patch("app.modules.planner.service.get_llm", return_value=make_fake_llm([llm_responses[2]])), \
         patch("app.modules.domain_agents.base.get_llm", return_value=make_fake_llm([llm_responses[3]])), \
         patch("app.modules.opportunity.service.get_llm", return_value=make_fake_llm([llm_responses[4]])), \
         patch("app.modules.recommendation.service.get_llm", return_value=make_fake_llm([llm_responses[5]])), \
         patch("app.modules.execution.service.get_llm", return_value=make_fake_llm([llm_responses[6]])), \
         patch("app.modules.memory.service.get_qdrant", return_value=fake_qdrant_3), \
         patch("app.modules.memory.service._embed", new=AsyncMock(return_value=[0.01] * 1536)):

        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)

        r = client.get("/health")
        check("GET /health -> 200", r.status_code == 200, r.text)

        r = client.post("/api/v1/orchestrate", json={
            "user_id": "user_1",
            "message": "I want to switch my career into tech",
            "session_id": "sess_1",
            "context": {"life_mission": "Grow professionally"},
        })
        check("POST /api/v1/orchestrate -> 200", r.status_code == 200, r.text)
        body = r.json()
        check("Response has all OrchestrateResponse fields", all(
            k in body for k in ["intent", "mission_alignment", "plan", "domain_result",
                                 "opportunities", "recommendations", "execution_guidance", "memory_written"]
        ), body.keys())

        r = client.post("/api/v1/memory/search", json={"user_id": "user_1", "query": "career", "limit": 5})
        check("POST /api/v1/memory/search -> 200", r.status_code == 200, r.text)

        r = client.post("/api/v1/memory/write", json={"user_id": "user_1", "text": "test memory"})
        check("POST /api/v1/memory/write -> 200", r.status_code == 200, r.text)

    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    passed = sum(1 for _, s, _ in results if s == "PASS")
    failed = sum(1 for _, s, _ in results if s == "FAIL")
    print(f"Total: {len(results)}  Passed: {passed}  Failed: {failed}")
    if failed:
        print("\nFailed tests:")
        for name, status, detail in results:
            if status == "FAIL":
                print(f"  - {name}: {detail}")
    return failed == 0


def test_full_system():
    results.clear()
    ok = asyncio.run(run_all_tests())
    assert ok, f"Full system tests failed: {[r for r in results if r[1] == 'FAIL']}"
    return ok


if __name__ == "__main__":
    ok = test_full_system()
    exit(0 if ok else 1)
