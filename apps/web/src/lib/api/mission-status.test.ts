import { describe, expect, it } from "vitest";
import { normalizeMissionStatus } from "./mission-status";

describe("normalizeMissionStatus", () => {
  it("maps backend ACTIVE values to the frontend active state", () => {
    expect(normalizeMissionStatus("ACTIVE")).toBe("active");
    expect(normalizeMissionStatus("active")).toBe("active");
  });

  it("maps failed or warning values to at-risk", () => {
    expect(normalizeMissionStatus("FAILED")).toBe("at-risk");
    expect(normalizeMissionStatus("at-risk")).toBe("at-risk");
  });

  it("defaults unknown values to active", () => {
    expect(normalizeMissionStatus("unknown")).toBe("active");
  });
});
