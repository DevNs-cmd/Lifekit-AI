# Git and GitHub Collaboration Workflow

> **LifeKit-AI — Team Standard**
>
> This document defines the standard Git and GitHub workflow for all developers collaborating on the LifeKit-AI monorepo.

---

## 1. Purpose

This document establishes a shared Git and GitHub workflow for the LifeKit-AI team. Following a consistent process helps us:

- Keep the `main` branch stable at all times.
- Avoid conflicting changes between developers.
- Make code reviews predictable and manageable.
- Maintain a clear project history.

All four developers are expected to follow this workflow for every task.

---

## 2. Repository Structure

LifeKit-AI is a **monorepo** containing multiple applications and shared packages:

```
Lifekit-AI/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # NestJS backend
│   ├── ai-service/       # FastAPI AI service
│   └── worker/           # Background processing
├── packages/
│   └── shared-types/     # Shared TypeScript types/contracts
├── infrastructure/
│   ├── docker/           # Docker configuration files
│   └── nginx/            # NGINX reverse proxy configuration
├── docs/                 # Architecture and design documentation
├── docker-compose.yml    # Local infrastructure (PostgreSQL, Redis, Qdrant)
├── .env.example          # Environment variable template
├── .gitignore
└── README.md
```

Developers should work only in the area relevant to their task. However, some features may span multiple applications — those cross-application changes should be clearly communicated with the team.

---

## 3. Main Branch Rules

- **`main`** is the stable, shared branch.
- Normal feature development **must not** happen directly on `main`.
- Developers **must not** directly push feature work to `main`.
- **Do not force-push** to `main`.
- **Do not commit secrets**, passwords, API keys, or `.env` files.
- All changes must reach `main` through **Pull Requests**.

### Workflow Overview

```
main
  ↓
Update local main
  ↓
Create feature branch
  ↓
Work locally
  ↓
Review own changes
  ↓
Commit changes
  ↓
Push feature branch
  ↓
Create Pull Request
  ↓
Code review
  ↓
Address feedback
  ↓
Merge into main
```

---

## 4. Before Starting New Work

Always start from the latest version of `main`:

```bash
git switch main
git pull origin main
```

This ensures your work is based on the most recent code and reduces the chance of conflicts later.

---

## 5. Branch Naming Convention

Use the following format:

```
<type>/<short-description>
```

All branch names must be:
- **lowercase**
- **concise** and **descriptive**
- **hyphen-separated**

### Examples

| Branch Name                  | Description                          |
|------------------------------|--------------------------------------|
| `feature/mission-api`        | New mission-related API endpoints    |
| `feature/ai-planner`         | AI planner module implementation     |
| `feature/mission-dashboard`  | Mission dashboard UI                 |
| `fix/login-validation`       | Fix login validation bug             |
| `fix/auth-token-expiry`      | Fix expired token handling           |
| `refactor/auth-module`       | Restructure authentication module    |
| `docs/update-architecture`   | Update architecture documentation    |
| `chore/update-project-structure` | Update project scaffolding       |

---

## 6. Creating a Feature Branch

Each developer should create a separate branch for their task:

```bash
git switch -c feature/mission-api
```

### Common Branch Types

| Type       | When to Use                                      |
|------------|--------------------------------------------------|
| `feature/` | Adding a new feature or functionality            |
| `fix/`     | Fixing a bug or issue                            |
| `refactor/`| Restructuring code without changing behavior     |
| `docs/`    | Writing or updating documentation                |
| `chore/`   | Maintenance, tooling, dependencies, scaffolding  |

---

## 7. Working on Changes

While working on your branch:

- Keep your work **focused on the assigned task**.
- Avoid making unrelated changes in the same branch.
- Check the repository status regularly:

```bash
git status
```

- Inspect your changes before committing:

```bash
git diff
```

- Review your own changes before staging them — this helps catch issues early.

---

## 8. Commit Guidelines

Use clear, descriptive commit messages with the following format:

```
<type>: <short description>
```

### Good Examples

| Commit Message                              | Description                             |
|---------------------------------------------|-----------------------------------------|
| `feat: add mission creation endpoint`       | New feature implemented                 |
| `fix: resolve authentication issue`         | Bug fix                                 |
| `refactor: simplify user service`           | Code restructuring                      |
| `docs: update architecture documentation`   | Documentation change                    |
| `chore: initialize project structure`       | Maintenance or scaffolding              |
| `test: add mission validation tests`        | Test additions or updates               |

### Bad Examples (Avoid These)

| Commit Message | Why It's Unhelpful              |
|----------------|---------------------------------|
| `update`       | Does not describe what changed  |
| `changes`      | Vague and meaningless           |
| `final`        | Does not indicate the change    |
| `final2`       | Confusing and unclear           |
| `new code`     | Does not describe what was added|
| `test`         | Unclear what was tested         |

Commit messages should clearly describe **what** changed and, when relevant, **why**.

### Staging and Committing

```bash
git add .
git commit -m "feat: add mission creation endpoint"
```

---

## 9. Pushing a Feature Branch

The first time you push a branch to GitHub:

```bash
git push -u origin feature/mission-api
```

For subsequent pushes to the same branch:

```bash
git push
```

---

## 10. Creating a Pull Request

1. Push your feature branch to GitHub.
2. Open the **LifeKit-AI** GitHub repository.
3. Click **Compare & Pull Request** or navigate to the Pull Requests tab.
4. Set the **base** branch to `main`.
5. Set the **compare** branch to your feature branch.
6. GitHub will automatically load the PR template from `.github/pull_request_template.md`.
7. Fill out every relevant section of the template.
8. Add reviewers if required.
9. Address review feedback.
10. Wait for the team's required checks and approvals.
11. Merge the PR only when the team's merge requirements are satisfied.

> **Note:** Before opening a Pull Request, developers should verify the changes relevant to their work. Application-specific build, test, lint, and validation commands will be documented separately once the individual applications are fully configured.

---

## 12. Keeping Pull Requests Focused

A focused PR is easier to review, debug, and merge.

### Good Example

**Branch:** `feature/mission-api`

- Adds mission creation endpoint.
- Adds related validation.
- Adds relevant supporting changes.

### Bad Example

**Branch:** `feature/misc-changes`

- Changes authentication.
- Redesigns dashboard.
- Updates Docker configuration.
- Refactors unrelated services.

If your changes span multiple logical concerns, consider splitting them into separate branches and PRs.

---

## 13. Keeping a Feature Branch Updated

As you work, `main` may move forward with changes from other team members. Keep your feature branch updated:

```bash
git switch main
git pull origin main
git switch feature/your-branch
git merge main
```

After merging `main` into your branch, verify that your changes still work correctly.

---

## 14. Handling Merge Conflicts

When two developers modify the same part of a file, a merge conflict occurs. Resolve it carefully:

1. Update your local `main` branch.
2. Merge `main` into your feature branch.
3. Open the conflicting files.
4. Understand **both versions** of the change — yours and the one from `main`.
5. Edit the file to keep the correct combination of changes.
6. Remove all conflict markers.
7. Review the resulting code to ensure correctness.
8. Save the file, stage it, and commit the resolution.
9. Push the updated branch.

### Conflict Marker Example

```
<<<<<<< HEAD
your changes
=======
changes from main
>>>>>>> main
```

> **Important:** Do not blindly choose one side without understanding what the conflict is about. When in doubt, discuss with the developer who made the other change.

---

## 15. Team Rules

- **Always update from `main`** before starting new work.
- **Use a separate branch** for each logical task.
- **Do not directly push** normal feature work to `main`.
- **Do not force-push** shared branches.
- **Never commit secrets**, passwords, API keys, or `.env` files.
- **Keep Pull Requests focused** on a single logical change.
- **Communicate** before making large architectural changes.
- **Mention cross-application changes** clearly in the PR description.
- **Do not mix** unrelated cleanup with feature work unless absolutely necessary.
- **Keep the `main` branch stable** — it should always be in a working state.

---

## 16. Quick Reference

### Complete Command Workflow

```bash
# 1. Start from the latest main
git switch main
git pull origin main

# 2. Create a feature branch
git switch -c feature/my-feature

# 3. Work on the feature
# ... make changes ...

# 4. Review your changes
git status
git diff

# 5. Commit your changes
git add .
git commit -m "feat: describe the change"

# 6. Push the branch (first time)
git push -u origin feature/my-feature

# 7. Push subsequent updates
git push
```

### Pull Request Process

```
GitHub → Create Pull Request → Base: main → Review → Address feedback → Merge
```

### Updating a Feature Branch

```bash
git switch main
git pull origin main
git switch feature/your-branch
git merge main
```

