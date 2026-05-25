# **PRD - Vine AI: Phytosanitary Mapping Workflow via Mistral**
**Version**: 1.0
**Author**: Jules DAYAUX
**Date**: May 25, 2026
**Status**: Draft
**Ticket**: VINEAI-001

---

## 1. Objectives & Core Intentions

### **Brief Description**
This workflow automates the transformation of **phytosanitary diagnostic data** (embedding vectors, diseases, GPS coordinates, confidence indices) into **interactive maps** to visualize the health status of vineyard plots.
The goal is to provide a **clear, actionable, and visual representation** for viticulturists, enabling them to quickly identify high-risk areas (e.g., Mildew, Powdery Mildew) and take appropriate action.

### **What to Provide to AI**
- **Business Problem**: Raw diagnostic data (vectors, diseases) is not usable without visualization.
- **Non-Negotiable Constraints**:
  - **No external dependencies** (except Mistral Small for text descriptions).
  - **Simple storage**: Generated files stored in the GitHub repository.
  - **Performance**: Reasonable generation time for 100 plants.
  - **Accuracy**: Coordinates and diagnostics must be **faithful** to reality.
  - **Clarity**: The map must be **immediately understandable** (legend, popups, heatmap).

---

## 2. Unambiguous Clauses

### **Brief Description**
The workflow is divided into **three atomic steps**: generating text descriptions, generating heatmap images from vectors, and creating an interactive Leaflet map. Each step has clearly defined inputs and outputs.

### **What to Provide to AI**
- `REQ-001`: The workflow **MUST** accept as input a JSON file containing a list of plants, where each plant has:
  - A `plantId` (string, unique).
  - A `disease` (string, one of: "Mildew", "Powdery Mildew", "Healthy").
  - A `confidence` (number, between 0.0 and 1.0).
  - `coordinates` (tuple of 2 numbers, [latitude, longitude]).
  - A `vector` (array of numbers, embeddings for heatmap generation).

- `REQ-002`: The workflow **MUST** validate the input data schema before processing. If a plant does not comply with the schema, it **MUST** be excluded and listed in an `invalid_plants.json` file.

- `REQ-003`: The workflow **MUST** generate a text description for each valid plant using **Mistral Small**, based **only** on `disease` and `confidence`. Vectors **MUST NOT** be used for this step.

- `REQ-004`: The workflow **MUST** transform each vector into a **static heatmap image** (256x256 pixels) and store it in `maps/images/{plantId}.png`.

- `REQ-005`: The workflow **MUST** generate a **global Leaflet map** (`global_map.html`) with:
  - An **OpenStreetMap** base layer.
  - A **heatmap** based on the **number of diseased plants per area** (intensity = 1 per diseased plant).
  - **Popups** (not tooltips) for each plant, displaying:
    - `plantId`
    - `disease`
    - `confidence` (as a percentage)
    - `description`
    - The associated heatmap image.
  - A **legend** to interpret heatmap colors and diseases.

- `REQ-006`: The workflow **MUST** store all generated files (HTML, images) in the `maps/` directory of the GitHub repository.

- `REQ-007`: The workflow **MUST** return a **direct public URL** to `global_map.html` as output.

---

## 3. Challenging Prompts & Edge Cases

### **Brief Description**
Success criteria cover the correct generation of the map, error handling, and workflow robustness in the face of invalid or missing data.

### **What to Provide to AI**
- What happens if a plant has invalid coordinates (e.g., latitude = 200)?
  → **Answer**: The plant is excluded from the map and listed in `invalid_plants.json`.

- What happens if a call to Mistral Small fails for a plant?
  → **Answer**: The plant is processed without a description (empty `description` field), and a log is generated.

- What happens if a plant's vector is empty or malformed?
  → **Answer**: An empty heatmap image (black) is generated, and a log is emitted.

- How does the workflow handle 100 plants as input?
  → **Answer**: The workflow **MUST** generate the map in less than 5 minutes.

- What happens if no plants are valid?
  → **Answer**: The workflow generates an empty `global_map.html` file with an error message: "No valid plants to display."

---

## 4. Anti-Patterns & Forbidden Behaviors

### **Brief Description**
List of strictly forbidden behaviors to ensure the reliability and maintainability of the workflow.

### **What to Provide to AI**
- The workflow **MUST NEVER** delete or modify the input data (`input.json`).

- The workflow **MUST NEVER** display invalid coordinates on the map.

- The workflow **MUST NEVER** generate a map without a legend.

- The workflow **MUST NEVER** use vectors to generate descriptions (only `disease` and `confidence`).

- The workflow **MUST NEVER** store generated files outside the `maps/` directory.

- The workflow **MUST NEVER** ignore errors (all errors must be logged).

---

## 5. Executable Specifications / Unit Tests

### **Brief Description**
Concrete examples to anchor understanding of the workflow and validate its behavior.

### **What to Provide to AI**

```
Input:
{
"plants": [
{
"plantId": "vine_001",
"disease": "Mildew",
"confidence": 0.95,
"coordinates": [43.61, 3.88],
"vector": [0.1, 0.2, 0.3, 0.4]
},
{
"plantId": "vine_002",
"disease": "Powdery Mildew",
"confidence": 0.85,
"coordinates": [43.62, 3.89],
"vector": [0.2, 0.3, 0.1, 0.5]
},
{
"plantId": "vine_invalid_001",
"disease": "Mildew",
"confidence": 0.7,
"coordinates": [200, 200],
"vector": [0.1, 0.1, 0.1]
}
]
}

Expected Output:
- File `maps/global_map.html`:
  - Leaflet map with:
    - 2 valid plants (vine_001, vine_002) displayed with popups.
    - Heatmap centered on [43.61, 3.88].
    - Visible legend.
- File `maps/invalid_plants.json`:
  [
  {
  "plantId": "vine_invalid_001",
  "disease": "Mildew",
  "confidence": 0.7,
  "coordinates": [200, 200],
  "vector": [0.1, 0.1, 0.1],
  "error": "Invalid coordinates"
  }
  ]
- Files `maps/images/vine_001.png` and `maps/images/vine_002.png` generated.
- Output URL: `https://github.com/<user>/<repo>/blob/main/maps/global_map.html`
```

```
Input:
{
"plants": []
}

Expected Output:
- File `maps/global_map.html` with a message: "No valid plants to display."
- Empty or non-existent `maps/invalid_plants.json` file.
```

---
## 6. System Interfaces & Boundaries

### **Brief Description**
Mapping of the workflow's contact points with its ecosystem.

### **What to Provide to AI**
- **Actors**:
  - **User**: Triggers the workflow and views the generated map.
  - **Mistral Workflow**: Orchestrates processing steps.
  - **Mistral Small API**: Provides text descriptions.

- **Third-Party Systems**:
  - **GitHub**: Stores generated files (HTML, images) and hosts the map via GitHub Pages.

- **Protocols**:
  - **HTTP/REST**: For calls to Mistral Small.
  - **Git**: For versioning and file storage.
  - **JSON**: Format for input/output data.
