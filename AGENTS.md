# Mistral Vibe + Spec Kit Agent Skills

This file defines **reusable workflows** for using **Spec Kit** with **Mistral Vibe**. Since Mistral Vibe does not natively support slash commands (like `/speckit.specify`), these prompts standardize the **Spec-Driven Development (SDD)** process.

---

## 📌 **How to Use This File**
1. **Copy the prompt** for the step you want to execute (e.g., Constitution, Specify, Plan).
2. **Paste it into Mistral Vibe** and replace placeholders (e.g., `[PROJECT_NAME]`, `[FEATURE]`).
3. **Let Mistral Vibe execute** the workflow using its tools (`read_file`, `write_file`, `bash`, etc.).

---

## 🏗️ **Spec-Driven Development (SDD) Workflow**

### **Phase 0: Project Setup (Already Done for Agricole)**
- ✅ Spec Kit initialized (`specify init Agricole --integration copilot`).
- ✅ GitHub repository configured (`julesgabriel/workflow-mistral-agricole`).
- ✅ Templates and scripts installed (`.specify/`, `.github/`).

---

### **Phase 1: Constitution (Project Principles)**
**Purpose**: Define the **governing principles** for your project (e.g., code quality, testing, UX, performance).

**Prompt Template**:
```
Draft a project constitution for [PROJECT_NAME] focusing on [FOCUS_AREAS]. 
Use the template in `.specify/templates/spec-template.md` as a reference for structure, but adapt it for a constitution.
Save the output to `.specify/memory/constitution.md`.

Requirements:
- Include sections for: Code Quality, Testing Standards, User Experience, Performance, Security, and Governance.
- Be specific: e.g., "All functions must have JSDoc comments" or "Unit tests must cover >90% of code".
- Align with the project's goals (e.g., Agricole is for farmers, so prioritize simplicity and reliability).
```

**Example for Agricole**:
```
Draft a project constitution for Agricole focusing on code quality, testing standards, user experience, performance, and security. 
Use the template in `.specify/templates/spec-template.md` as a reference for structure, but adapt it for a constitution.
Save the output to `.specify/memory/constitution.md`.

Requirements:
- Code Quality: All JavaScript/TypeScript code must follow ESLint rules. Use meaningful variable names.
- Testing: Unit tests (Jest) must cover >80% of backend code. Integration tests for all API endpoints.
- User Experience: Prioritize intuitive UI for non-technical users (farmers). Mobile-responsive design.
- Performance: Database queries must execute in <500ms. Optimize image loading for crop photos.
- Security: Sanitize all user inputs. Use HTTPS and environment variables for secrets.
- Governance: All PRs must be reviewed by at least one team member. Follow GitHub Flow branching model.
```

**Output Location**: `.specify/memory/constitution.md`

---

### **Phase 2: Specify (Feature Requirements)**
**Purpose**: Define **what** you want to build (user stories, functional requirements). Focus on the **problem**, not the solution.

**Prompt Template**:
```
Create a specification for [FEATURE_NAME] in [PROJECT_NAME]. 
Use the template in `.specify/templates/spec-template.md`.
Save the output to `specs/[FEATURE_ID]-[FEATURE_NAME]/spec.md`.

Requirements:
- Follow the template structure: Title, Description, User Stories, Functional Requirements, Non-Functional Requirements, Assumptions, Dependencies, and Open Questions.
- Be detailed: Include edge cases, error handling, and validation rules.
- Avoid technical implementation details (save those for the Plan phase).
- Assign a unique ID (e.g., `001`, `002`) to the feature.
```

**Example for Agricole (Crop Management)**:
```
Create a specification for crop management in Agricole. 
Use the template in `.specify/templates/spec-template.md`.
Save the output to `specs/001-crop-management/spec.md`.

Requirements:
- Title: "Crop Management System"
- Description: Allow farmers to add, edit, and track crops, including planting/harvesting dates and growth stages.
- User Stories:
  - As a farmer, I want to add a new crop with its name, type, planting date, and expected harvest date so I can track my farm's production.
  - As a farmer, I want to edit crop details (e.g., harvest date) so I can update my records.
  - As a farmer, I want to view a list of all my crops sorted by planting date so I can plan my work.
- Functional Requirements:
  - CRUD operations for crops.
  - Validation: Planting date must be before harvest date.
  - Search/filter crops by name, type, or date range.
- Non-Functional Requirements:
  - Load crop list in <2 seconds.
  - Support 10,000+ crops per user.
- Assumptions:
  - Users are authenticated (handled by a separate Auth feature).
  - Crops are stored in a database.
- Dependencies:
  - Requires the Auth system to be implemented first.
- Open Questions:
  - Should crops be organized by fields/farms?
  - Should we support bulk uploads (e.g., CSV)?
```

**Output Location**: `specs/[FEATURE_ID]-[FEATURE_NAME]/spec.md`

---

### **Phase 3: Clarify (Optional but Recommended)**
**Purpose**: Resolve ambiguities in the spec **before** planning to avoid rework.

**Prompt Template**:
```
Review the spec for [FEATURE_NAME] in `specs/[FEATURE_ID]-[FEATURE_NAME]/spec.md`.
Identify ambiguous or underspecified areas, then ask structured questions to clarify them.
Append the clarifications to the spec under a new "## Clarifications" section.

Focus on:
- Missing details (e.g., "What fields are required for a crop?").
- Edge cases (e.g., "What happens if a user enters a harvest date before the planting date?").
- Open questions from the spec.
```

**Example for Agricole**:
```
Review the spec for crop management in `specs/001-crop-management/spec.md`.
Identify ambiguous or underspecified areas, then ask structured questions to clarify them.
Append the clarifications to the spec under a new "## Clarifications" section.

Focus on:
- Should crops be assigned to specific fields or locations?
- Should we support historical data (e.g., past harvests)?
- What crop types should be supported (e.g., predefined list or free text)?
```

---

### **Phase 4: Plan (Technical Implementation)**
**Purpose**: Define **how** to build the feature (tech stack, architecture, components).

**Prompt Template**:
```
Create a technical implementation plan for [FEATURE_NAME] in [PROJECT_NAME]. 
Use the template in `.specify/templates/plan-template.md`.
Save the output to `specs/[FEATURE_ID]-[FEATURE_NAME]/plan.md`.

Requirements:
- Reference the spec in `specs/[FEATURE_ID]-[FEATURE_NAME]/spec.md`.
- Include sections: Overview, Tech Stack, Architecture, Data Model, API Contracts, UI Components, External Dependencies, and Risks.
- Be specific: List libraries, frameworks, and tools (e.g., "React + Material-UI for frontend").
- Break the feature into logical components (e.g., Backend, Frontend, Database).
- Include a high-level sequence diagram or flowchart if helpful.
```

**Example for Agricole (Crop Management)**:
```
Create a technical implementation plan for crop management in Agricole. 
Use the template in `.specify/templates/plan-template.md`.
Save the output to `specs/001-crop-management/plan.md`.

Requirements:
- Tech Stack:
  - Frontend: React 18 + TypeScript + Material-UI
  - Backend: Node.js + Express + PostgreSQL
  - Database: PostgreSQL (hosted on Supabase)
- Architecture:
  - Frontend: Single-page app (SPA) with React Router.
  - Backend: RESTful API with endpoints for `/crops` (CRUD).
  - Database: Tables for `crops` (id, name, type, planting_date, harvest_date, user_id).
- Data Model:
  ```
  Table: crops
  - id: UUID (primary key)
  - name: VARCHAR(255) (required)
  - type: VARCHAR(100) (e.g., "Wheat", "Corn")
  - planting_date: DATE (required)
  - harvest_date: DATE (required, must be > planting_date)
  - user_id: UUID (foreign key to users table)
  - created_at: TIMESTAMP (auto)
  - updated_at: TIMESTAMP (auto)
  ```
- API Contracts:
  - `GET /api/crops` - List all crops for the authenticated user.
  - `POST /api/crops` - Create a new crop.
  - `PUT /api/crops/:id` - Update a crop.
  - `DELETE /api/crops/:id` - Delete a crop.
- UI Components:
  - `CropList`: Displays crops in a table with sorting/filtering.
  - `CropForm`: Modal for adding/editing crops.
  - `CropCard`: Compact view for crop details.
- External Dependencies:
  - PostgreSQL database.
  - Auth service (assume it exists).
- Risks:
  - Performance: Large crop lists may slow down the UI (mitigation: pagination).
  - Data validation: Ensure harvest_date > planting_date on backend.
```

**Output Location**: `specs/[FEATURE_ID]-[FEATURE_NAME]/plan.md`

---

### **Phase 5: Tasks (Actionable Breakdown)**
**Purpose**: Break the plan into **small, executable tasks** with dependencies.

**Prompt Template**:
```
Break the plan for [FEATURE_NAME] in `specs/[FEATURE_ID]-[FEATURE_NAME]/plan.md` into actionable tasks. 
Use the template in `.specify/templates/tasks-template.md`.
Save the output to `specs/[FEATURE_ID]-[FEATURE_NAME]/tasks.md`.

Requirements:
- Organize tasks by component (e.g., Backend, Frontend, Database).
- Order tasks to respect dependencies (e.g., Database schema before API endpoints).
- Mark parallelizable tasks with `[P]` (can be done simultaneously).
- Include file paths where changes should be made (e.g., `src/backend/routes/crops.js`).
- Add a "## Checkpoints" section to validate progress (e.g., "Backend API works with Postman").
- If tests are required, include test tasks (TDD: write tests before implementation).
```

**Example for Agricole (Crop Management)**:
```
Break the plan for crop management in `specs/001-crop-management/plan.md` into actionable tasks. 
Use the template in `.specify/templates/tasks-template.md`.
Save the output to `specs/001-crop-management/tasks.md`.

Requirements:
- Backend Tasks:
  1. Create database migration for `crops` table.
  2. Implement `Crop` model and database queries.
  3. Create API routes for `/api/crops` (CRUD).
  4. Add input validation for crop data.
  5. Write unit tests for crop routes.
- Frontend Tasks:
  1. [P] Create `CropList` component to display crops in a table.
  2. [P] Create `CropForm` component for adding/editing crops.
  3. Create `CropCard` component for compact crop details.
  4. Implement API service for fetching/updating crops.
  5. Add crop management page with routing.
- Checkpoints:
  - Backend: Test all API endpoints with Postman/curl.
  - Frontend: Verify crop list loads and forms submit correctly.
  - Integration: Test full flow (add crop → see it in list).
```

**Output Location**: `specs/[FEATURE_ID]-[FEATURE_NAME]/tasks.md`

---

### **Phase 6: Analyze (Optional but Recommended)**
**Purpose**: Validate **consistency** between spec, plan, and tasks.

**Prompt Template**:
```
Perform a cross-artifact analysis for [FEATURE_NAME] in `specs/[FEATURE_ID]-[FEATURE_NAME]/`.
Check for:
1. **Coverage**: Are all requirements from the spec addressed in the plan and tasks?
2. **Consistency**: Do the plan and tasks align with the spec?
3. **Completeness**: Are there missing components or edge cases?
4. **Dependencies**: Are tasks ordered correctly? Are there unresolved dependencies?

Generate a report and save it to `specs/[FEATURE_ID]-[FEATURE_NAME]/analysis.md`.
Include a checklist of items to address before implementation.
```

**Example for Agricole**:
```
Perform a cross-artifact analysis for crop management in `specs/001-crop-management/`.
Check for:
1. Coverage: Are all user stories from the spec addressed in the plan and tasks?
2. Consistency: Does the database schema in the plan match the spec's requirements?
3. Completeness: Are there missing API endpoints or UI components?
4. Dependencies: Are the tasks ordered correctly (e.g., database before API)?

Generate a report and save it to `specs/001-crop-management/analysis.md`.
```

**Output Location**: `specs/[FEATURE_ID]-[FEATURE_NAME]/analysis.md`

---

### **Phase 7: Implement (Execute Tasks)**
**Purpose**: Build the feature by executing tasks in order.

**Prompt Template**:
```
Execute the tasks for [FEATURE_NAME] in `specs/[FEATURE_ID]-[FEATURE_NAME]/tasks.md` in order.

Requirements:
- Follow the task order and respect dependencies.
- For parallel tasks (marked `[P]`), execute them simultaneously if possible.
- Commit changes after completing each logical group of tasks (e.g., "feat: Add crop database schema").
- If a task requires a file to be created/edited, use the exact path specified in the task.
- If tests are included, run them to validate implementation.
- Update the task list to mark completed tasks as `[x]`.

Start with the first task and proceed step-by-step.
```

**Example for Agricole**:
```
Execute the tasks for crop management in `specs/001-crop-management/tasks.md` in order.

Requirements:
- Start with the database migration task.
- Commit after completing the backend tasks with message: "feat: Add crop API endpoints".
- Commit after completing the frontend tasks with message: "feat: Add crop management UI".
- Run tests after each major component is implemented.
- Update the task list to mark completed tasks as `[x]`.
```

---

### **Phase 8: Checklist (Quality Validation)**
**Purpose**: Validate the feature against requirements.

**Prompt Template**:
```
Generate a quality checklist for [FEATURE_NAME] based on the spec in `specs/[FEATURE_ID]-[FEATURE_NAME]/spec.md`.
Use the template in `.specify/templates/checklist-template.md` if available.
Save the output to `specs/[FEATURE_ID]-[FEATURE_NAME]/checklist.md`.

Requirements:
- Include checks for:
  - All user stories from the spec are implemented.
  - All functional requirements are met.
  - Non-functional requirements (e.g., performance, security) are validated.
  - Edge cases are handled (e.g., invalid inputs, errors).
  - Code follows the project constitution (e.g., testing standards).
- Mark each item as `[ ]` (pending) or `[x]` (passed).
```

**Example for Agricole**:
```
Generate a quality checklist for crop management based on the spec in `specs/001-crop-management/spec.md`.
Save the output to `specs/001-crop-management/checklist.md`.

Requirements:
- User Stories:
  - [ ] As a farmer, I can add a new crop with name, type, planting date, and harvest date.
  - [ ] As a farmer, I can edit crop details.
  - [ ] As a farmer, I can view a list of all my crops sorted by planting date.
- Functional Requirements:
  - [ ] CRUD operations for crops work correctly.
  - [ ] Validation: Harvest date must be after planting date.
  - [ ] Search/filter crops by name, type, or date range.
- Non-Functional Requirements:
  - [ ] Crop list loads in <2 seconds.
  - [ ] Supports 10,000+ crops per user.
- Constitution Compliance:
  - [ ] All code follows ESLint rules.
  - [ ] Unit tests cover >80% of backend code.
```

**Output Location**: `specs/[FEATURE_ID]-[FEATURE_NAME]/checklist.md`

---

## 🔄 **Workflow Summary**
| Phase | Command (Slash) | Mistral Vibe Prompt | Output File |
|-------|------------------|---------------------|-------------|
| Constitution | `/speckit.constitution` | Use **Phase 1** prompt | `.specify/memory/constitution.md` |
| Specify | `/speckit.specify` | Use **Phase 2** prompt | `specs/[ID]-[NAME]/spec.md` |
| Clarify | `/speckit.clarify` | Use **Phase 3** prompt | `specs/[ID]-[NAME]/spec.md` (appended) |
| Plan | `/speckit.plan` | Use **Phase 4** prompt | `specs/[ID]-[NAME]/plan.md` |
| Tasks | `/speckit.tasks` | Use **Phase 5** prompt | `specs/[ID]-[NAME]/tasks.md` |
| Analyze | `/speckit.analyze` | Use **Phase 6** prompt | `specs/[ID]-[NAME]/analysis.md` |
| Implement | `/speckit.implement` | Use **Phase 7** prompt | Code + commits |
| Checklist | `/speckit.checklist` | Use **Phase 8** prompt | `specs/[ID]-[NAME]/checklist.md` |

---

## 📁 **File Structure Reference**
```
Agricole/
├── .specify/
│   ├── memory/
│   │   └── constitution.md       # Phase 1 output
│   └── templates/                # Spec Kit templates
├── specs/
│   └── [FEATURE_ID]-[FEATURE_NAME]/
│       ├── spec.md               # Phase 2 output
│       ├── plan.md               # Phase 4 output
│       ├── tasks.md              # Phase 5 output
│       ├── analysis.md           # Phase 6 output (optional)
│       └── checklist.md           # Phase 8 output (optional)
└── AGENTS.md                     # This file
```

---

## 🚀 **Quick Start for Agricole**
1. **Start with the Constitution**:
   ```
   Draft a project constitution for Agricole focusing on code quality, testing standards, user experience, performance, and security. 
   Use the template in `.specify/templates/spec-template.md` as a reference. 
   Save the output to `.specify/memory/constitution.md`.
   ```

2. **Create Your First Spec**:
   ```
   Create a specification for crop management in Agricole. 
   Use the template in `.specify/templates/spec-template.md`. 
   Save the output to `specs/001-crop-management/spec.md`.
   ```

3. **Generate a Plan**:
   ```
   Create a technical implementation plan for crop management in Agricole. 
   Use the template in `.specify/templates/plan-template.md`. 
   Save the output to `specs/001-crop-management/plan.md`.
   ```

4. **Break into Tasks**:
   ```
   Break the plan for crop management in `specs/001-crop-management/plan.md` into actionable tasks. 
   Use the template in `.specify/templates/tasks-template.md`. 
   Save the output to `specs/001-crop-management/tasks.md`.
   ```

5. **Implement**:
   ```
   Execute the tasks for crop management in `specs/001-crop-management/tasks.md` in order.
   ```

---

## 📌 **Tips for Mistral Vibe**
1. **Use `read_file` to reference templates**:
   - Example: `read_file(path: ".specify/templates/spec-template.md")` to see the spec template.

2. **Use `write_file` to save outputs**:
   - Example: `write_file(path: "specs/001-crop-management/spec.md", content: "...")`.

3. **Use `bash` for Git operations**:
   - Example: `bash(command: "cd /workspace/Agricole && git add -A && git commit -m 'feat: Add crop management spec'")`.

4. **Commit frequently**:
   - After completing each phase (e.g., spec, plan, tasks), commit your changes.

---

## 🔗 **Resources**
- [Spec Kit Official Docs](https://github.github.io/spec-kit/)
- [Spec-Driven Development Methodology](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Spec Kit Templates](https://github.com/github/spec-kit/tree/main/templates)
