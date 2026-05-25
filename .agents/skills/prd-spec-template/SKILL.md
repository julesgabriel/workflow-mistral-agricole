---
name: prd-spec-template
description: >
  Create and validate PRD (Product Requirements Document) following the strict template-spec.md structure.
  Use when creating PRDs for SDD generation, need template validation, or want to ensure specification completeness.
  Keywords: PRD, specification, template-spec, SDD, requirements, REQ-
user-invocable: true
---

# Skill: PRD Specification Template

Use this skill when creating or validating a **PRD (Product Requirements Document)** that must strictly follow the `template-spec.md` structure for AI-driven SDD (Software Design Document) generation.

## When to Use

- Creating a new PRD for AI-assisted SDD generation
- Validating an existing PRD against the template-spec.md structure
- Need guidance on filling each section with proper content
- Ensuring all 6 mandatory sections are present and complete

## Template Structure Overview

The PRD must contain exactly these 6 sections in order:

```
1. Objectifs & Intentions Fondamentales (Intentions & Core Values)
2. Clauses de Spécification Univoques (Unambiguous Clauses)
3. Critères de Succès & Cas Limites Critiques (Challenging Prompts & Edge Cases)
4. Matrice de Comportements Interdits (Anti-Patterns & Bugs Spécifiés)
5. Exemples d'Entrées / Sorties (Executable Specifications / Unit Tests)
6. Interfaces avec le Monde Réel (System Interfaces & Boundaries)
```

## Step-by-Step: Creating a Valid PRD

### 1. Initialize the Document

Create a new markdown file (e.g., `prd-[feature-name].md`) with the following header:

```markdown
# [Feature Name] - Product Requirements Document

*Generated for AI-driven SDD creation*
```

### 2. Section 1: Objectifs & Intentions Fondamentales

**Required format:**
```markdown
## 1. Objectifs & Intentions Fondamentales (*Intentions & Core Values*)

* **Description succincte :** [Brief description of the vision and what the system MUST accomplish]
* **Ce qu'il faut fournir à l'IA :** [User problem to solve, the "why", and non-negotiable constraints]
```

**Content guidelines:**
- Define the global vision
- State what the system MUST accomplish for users
- List guiding principles (core values)
- Include non-negotiable constraints (speed, security, simplicity, etc.)

**Example:**
```markdown
## 1. Objectifs & Intentions Fondamentales (*Intentions & Core Values*)

* **Description succincte :** Créer un système de vote électronique sécurisé et transparent qui permet aux utilisateurs de voter de manière anonyme tout en garantissant l'intégrité du processus démocratique.
* **Ce qu'il faut fournir à l'IA :** Le problème de confiance dans les votes traditionnels, la nécessité d'anonymat absolu, et la contrainte non négociable de traçabilité complète pour l'audit sans compromettre l'anonymat.
```

### 3. Section 2: Clauses de Spécification Univoques

**Required format:**
```markdown
## 2. Clauses de Spécification Univoques (*Unambiguous Clauses*)

* **Description succincte :** [How the product is divided into business rules]
* **Ce qu'il faut fournir à l'IA :**
  - `REQ-001`: [First atomic requirement]
  - `REQ-002`: [Second atomic requirement]
  - `REQ-003`: [Third atomic requirement]
```

**Content guidelines:**
- Each requirement MUST have a unique identifier (REQ-XXX format)
- Use clear, unambiguous language
- Avoid jargon or vague terms
- Each clause should be atomic (one specific behavior per clause)

**Example:**
```markdown
## 2. Clauses de Spécification Univoques (*Unambiguous Clauses*)

* **Description succincte :** Le système de vote est découpé en règles métier atomiques couvrant l'authentification, le vote, et la vérification.
* **Ce qu'il faut fournir à l'IA :**
  - `REQ-001`: Le système DOIT authentifier chaque votant avec un token unique avant de permettre le vote
  - `REQ-002`: Le système DOIT enregistrer chaque vote de manière immutable dans une blockchain privée
  - `REQ-003`: Le système DOIT empêcher tout votant de voter plus d'une fois par élection
  - `REQ-004`: Le système DOIT générer une preuve de vote sans révéler l'identité du votant
```

### 4. Section 3: Critères de Succès & Cas Limites Critiques

**Required format:**
```markdown
## 3. Critères de Succès & Cas Limites Critiques (*Challenging Prompts & Edge Cases*)

* **Description succincte :** [How success criteria and edge cases are defined]
* **Ce qu'il faut fournir à l'IA :**
  - [Scenario 1: What happens if...]
  - [Scenario 2: Edge case description]
  - [Scenario 3: Complex situation]
```

**Content guidelines:**
- Define precise success criteria
- Include challenging scenarios
- Cover edge cases and contradictory inputs
- Help AI design robust architecture (error handling, resilience)

**Example:**
```markdown
## 3. Critères de Succès & Cas Limites Critiques (*Challenging Prompts & Edge Cases*)

* **Description succincte :** Critères de succès mesurables et scénarios complexes pour tester la robustesse du système.
* **Ce qu'il faut fournir à l'IA :**
  - Le système doit maintenir l'intégrité des votes même si 30% des nœuds de la blockchain tombent en panne
  - Que fait le système si un utilisateur coupe sa connexion Internet au milieu du processus de vote ?
  - Comment le système gère-t-il une attaque par déni de service pendant une élection ?
  - Que se passe-t-il si deux votes sont soumis simultanément pour le même votant (race condition) ?
```

### 5. Section 4: Matrice de Comportements Interdits

**Required format:**
```markdown
## 4. Matrice de Comportements Interdits (*Anti-Patterns & Bugs Spécifiés*)

* **Description succincte :** [List of forbidden behaviors]
* **Ce qu'il faut fournir à l'IA :**
  - Le système ne doit JAMAIS [forbidden behavior 1]
  - Le système ne doit JAMAIS [forbidden behavior 2]
  - Le système ne doit JAMAIS [forbidden behavior 3]
```

**Content guidelines:**
- Explicitly list behaviors the system MUST NEVER do
- Include undesirable side effects
- List UX flaws to avoid
- State forbidden architectural choices

**Example:**
```markdown
## 4. Matrice de Comportements Interdits (*Anti-Patterns & Bugs Spécifiés*)

* **Description succincte :** Comportements strictement interdits pour garantir la sécurité et l'intégrité du système.
* **Ce qu'il faut fournir à l'IA :**
  - Le système ne doit JAMAIS stocker de tokens d'authentification en clair dans la base de données
  - Le système ne doit JAMAIS permettre à un administrateur de voir le vote individuel d'un utilisateur
  - Le système ne doit JAMAIS bloquer le thread principal pendant le traitement d'un vote
  - L'interface ne doit JAMAIS afficher d'informations permettant de déduire l'identité d'un votant
```

### 6. Section 5: Exemples d'Entrées / Sorties

**Required format:**
```markdown
## 5. Exemples d'Entrées / Sorties (*Executable Specifications / Unit Tests*)

* **Description succincte :** [How examples anchor AI understanding]
* **Ce qu'il faut fournir à l'IA :**
  ```
  Entrée: [input data]
  Sortie attendue: [expected output]
  ```
  
  ```
  Entrée: [input data]
  Sortie attendue: [expected output]
  ```
```

**Content guidelines:**
- Provide concrete examples
- Include input data and exact expected output
- Make specifications "executable" for the AI
- Use code blocks for technical examples

**Example:**
```markdown
## 5. Exemples d'Entrées / Sorties (*Executable Specifications / Unit Tests*)

* **Description succincte :** Exemples concrets pour ancrer la compréhension de l'IA sur les comportements attendus.
* **Ce qu'il faut fournir à l'IA :**
  ```
  Entrée: POST /api/vote avec { "voter_id": "user123", "election_id": "election456", "choice": "optionA", "token": "valid_token" }
  Sortie attendue: { "status": "success", "vote_id": "vote789", "timestamp": "2024-01-15T10:30:00Z" }
  ```
  
  ```
  Entrée: POST /api/vote avec { "voter_id": "user123", "election_id": "election456", "choice": "optionA", "token": "invalid_token" }
  Sortie attendue: { "status": "error", "code": "AUTH_FAILED", "message": "Token invalide ou expiré" }
  ```
  
  ```
  Entrée: GET /api/vote/results?election_id=election456
  Sortie attendue: { "election_id": "election456", "results": { "optionA": 150, "optionB": 75, "optionC": 25 }, "total_votes": 250 }
  ```
```

### 7. Section 6: Interfaces avec le Monde Réel

**Required format:**
```markdown
## 6. Interfaces avec le Monde Réel (*System Interfaces & Boundaries*)

* **Description succincte :** [How the system integrates with its ecosystem]
* **Ce qu'il faut fournir à l'IA :**
  - **Acteurs:** [list of actors]
  - **Systèmes tiers:** [list of third-party systems]
  - **Protocoles:** [list of protocols]
```

**Content guidelines:**
- Define all contact points of the system
- List actors (users, administrators, etc.)
- Identify third-party systems (APIs, databases, etc.)
- Specify protocols (gRPC, REST, WebSocket, etc.)

**Example:**
```markdown
## 6. Interfaces avec le Monde Réel (*System Interfaces & Boundaries*)

* **Description succincte :** Cartographie des points de contact et intégration du système dans l'écosystème existant.
* **Ce qu'il faut fournir à l'IA :**
  - **Acteurs:** Votants authentifiés, Administrateurs d'élections, Auditeurs externes
  - **Systèmes tiers:** Base de données PostgreSQL (v15+), Service d'authentification OAuth 2.0, Blockchain Hyperledger Fabric
  - **Protocoles:** REST API (JSON), gRPC pour la communication inter-nœuds, WebSocket pour les notifications en temps réel
```

## Validation Checklist

Before finalizing your PRD, verify it meets all requirements:

- [ ] Document is in Markdown format (.md)
- [ ] All 6 main sections are present in correct order
- [ ] Each section has both "Description succincte" and "Ce qu'il faut fournir à l'IA" subsections
- [ ] Section 2 has at least 3 requirements with REQ-XXX identifiers
- [ ] Section 3 has at least 3 edge cases or challenging scenarios
- [ ] Section 4 has at least 3 forbidden behaviors
- [ ] Section 5 has at least 2 input/output examples
- [ ] Section 6 defines actors, third-party systems, and protocols
- [ ] All requirements use clear, unambiguous language
- [ ] No section is empty or contains placeholder text

## Quick Validation Command

To validate your PRD structure:

```bash
# Check for all 6 main sections
grep -c "^## [0-9]\." your-prd-file.md

# Should return 6

# Check for required subsections in each section
grep -c "Description succincte" your-prd-file.md
# Should return 6 (one per section)

grep -c "Ce qu'il faut fournir à l'IA" your-prd-file.md
# Should return 6 (one per section)

# Check for REQ- identifiers
grep -c "REQ-[0-9]" your-prd-file.md
# Should return at least 3
```

## Complete Example PRD

See the `examples.md` file for a complete, validated example PRD following this template.

## Related Skills

- `authoring-skills`: For creating and structuring agent skills
- `vibe`: For understanding Vibe CLI application internals
