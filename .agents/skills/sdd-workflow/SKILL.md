---
name: sdd-workflow
description: >
  Strict Specification-Driven Development executor for atomic task implementation from checklists.
  Use when implementing any project from TASKS.md or SPECS.md, enforcing one-task-at-a-time execution,
  automatic checklist tracking, and mandatory user validation between steps.
  Keywords: SDD, specification-driven, checklist, atomic implementation, task tracking
user-invocable: true
argument-hint: '<spec-directory>'
---

# Specification-Driven Development Workflow

**Role**: Strict SDD executor agent.

Use this skill when you need to implement a project **from a specification checklist**, following strict atomic execution rules.

## 5 Immutable Rules

1. **ANALYZE**: On first activation, parse and display the complete checklist with ALL `[ ]` boxes empty
2. **ATOMIC FOCUS**: Work on EXACTLY ONE task or sub-task per response. Never combine multiple tasks
3. **RENDER CODE**: For the current task only, produce clean, testable code that satisfies ALL specification requirements and edge cases
4. **UPDATE**: After each implementation, re-display the full checklist with completed tasks marked `[x]`
5. **TRANSITION**: Always wait for explicit user confirmation ("OK", "Next", or correction) before advancing

## When to Use

- Implementing any project from a structured task checklist
- Need strict enforcement of single-task focus
- Want automatic progress tracking and visualization
- Following Specification-Driven Development methodology

## Quick Start

```
Use sdd-workflow skill for specs/my-project
Load sdd-workflow with path specs/any-project
```

## Workflow

### Step 1: Initialize

When invoked with a specification directory:
1. Locate `TASKS.md` (primary) or `SPECS.md` in the directory
2. Parse all checklist items marked with `[ ]` or `[x]`
3. Build task hierarchy (Phases → Tasks → Sub-tasks)
4. **Display complete checklist with ALL `[ ]` boxes**

### Step 2: Parse Tasks

Recognizes markdown patterns:

```markdown
# Phase 1: Any Phase Name

* [ ] **Task 1.1: Any Task Title**
* [ ] Any sub-task description
* [ ] Another sub-task

* [ ] **Task 1.2: Another Task**
* [ ] Sub-task detail
```

**Hierarchy**:
- Phases: Markdown headers
- Tasks: Bold text with numbering (`**Task X.Y: Name**`)
- Sub-tasks: List items with `[ ]` under a Task

### Step 3: Select Task

Automatically picks the **first pending task** (top-to-bottom, depth-first).

### Step 4: Implement

For the selected task ONLY:
1. Read specification requirements (follow any `REQ-XXX` references)
2. Identify constraints and edge cases from SPECS.md
3. Write code following specification exactly:
   - Use the language specified in the project
   - Zero external dependencies unless explicitly allowed
   - Handle ALL edge cases from the specification
   - Include proper error handling
4. Verify implementation (compilation, linting, spec compliance)

### Step 5: Update & Await

1. Mark implemented task(s) as `[x]`
2. Re-display complete checklist with progress
3. **STOP and wait for user validation**

### Step 6: Complete

When all tasks are `[x]`:
- Show completion summary
- List created/modified files
- Suggest verification steps

## Task Implementation

### For Any Task

**Do**:
- Implement exactly what the specification requires
- Handle all documented edge cases
- Include validation for inputs
- Add error handling for failures
- Match project coding standards

**Don't**:
- Add features not in the specification
- Skip edge cases mentioned in SPECS.md
- Use external dependencies not explicitly allowed
- Proceed without user validation

### Example: Generic Implementation

If specification says:
> Implement a function that validates user input is non-empty string

**Code**:
```typescript
// Example in TypeScript - adapt to project language
export function validateInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  if (input.trim() === '') {
    throw new Error('Input cannot be empty');
  }
  return input;
}
```

**Verification**:
```bash
# Run project-specific checks
npm run lint
npm run type-check
```

## Command Reference

### Activation
```
Use sdd-workflow skill for <path>
Load sdd-workflow with <directory>
```

### Checklist
```
Display checklist
Show tasks
Show progress
```

### Navigation
```
Implement next task
Start task X.Y
Skip to task X.Y
```

### Status
```
Mark task X.Y as complete
Mark task X.Y as incomplete
Reset all tasks
```

### Information
```
What does task X.Y require?
Show specification for task X.Y
Explain current task
```

## Checklist Display Format

```markdown
# 📋 Project Name (ID) - Implementation Checklist

## Phase 1: Phase Name

* [ ] **Task 1.1: Task Title**
* [ ] Sub-task 1
* [ ] Sub-task 2

* [ ] **Task 1.2: Another Task**
* [ ] Detail

## Phase 2: Next Phase

* [ ] **Task 2.1: First Task**

---
**Progress**: X/Y tasks (Z%)
**Next**: Task A.B - Title
Awaiting confirmation
```

## Example Session

```
User: Use sdd-workflow for specs/my-project

Agent:
# 📋 My Project (MP-001) - Implementation Checklist

## Phase 1: Foundation

* [ ] **Task 1.1: Setup Environment**
* [ ] Initialize project structure
* [ ] Configure build tools

## Phase 2: Core Features

* [ ] **Task 2.1: Implement Feature A**
* [ ] Create module
* [ ] Add validation

---
**Progress**: 0/4 tasks (0%)
**Next**: Task 1.1 - Setup Environment
Awaiting your confirmation to proceed.

User: OK

Agent:
Implementing Task 1.1: Setup Environment

[Creates files as specified]

---
# 📋 My Project (MP-001) - Updated Checklist

## Phase 1: Foundation

* [x] **Task 1.1: Setup Environment**
* [x] Initialize project structure
* [x] Configure build tools

## Phase 2: Core Features

* [ ] **Task 2.1: Implement Feature A**
* [ ] Create module
* [ ] Add validation

---
**Progress**: 2/4 tasks (50%)
**Next**: Task 2.1 - Implement Feature A
Awaiting your confirmation to proceed.
```

## Integration with AGENTS.md

```markdown
## SDD Workflow

- Use $sdd-workflow for strict specification-driven implementation
- One task at a time, always wait for user validation
```

## Best Practices

1. Always display full checklist first
2. Never implement multiple tasks in one response
3. Complete all sub-tasks before marking parent complete
4. Verify each implementation before marking done
5. Wait for explicit user confirmation before proceeding
6. Handle all specification edge cases

## Related Skills

- `prd-spec-template`: For creating valid PRD structure before SDD
- `authoring-skills`: For skill creation guidelines

## Troubleshooting

**"No checklist found"**:
- Ensure TASKS.md or SPECS.md exists in the directory
- Verify tasks use `[ ]` or `[x]` markers
- Check markdown formatting

**"Cannot parse tasks"**:
- Use consistent task format: `* [ ] **Task X.Y: Name**`
- Maintain proper hierarchy

**"Task already complete"**:
- Use `mark as incomplete` to rework

## Version

- **v1.0**: Core SDD workflow with strict atomic execution
