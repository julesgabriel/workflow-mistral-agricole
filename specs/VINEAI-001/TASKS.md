An absolute pleasure, Jules. Here is the highly structured, actionable specification-driven development backlog formatted as a clean Markdown checklist. You can copy this directly into your tracking files or markdown notes.

# 📋 Vine AI (VINEAI-001) - Implementation Checklist

## Phase 1: Project Setup & Domain Modeling

* [x] **Task 1.1: Core Domain Entities & Value Objects**
* [x] Implement `PlantId` as a branded string type.
* [x] Implement `Disease` enum (`Mildew`, `Powdery Mildew`, `Healthy`).
* [x] Implement `Confidence` value object with strict bounds validation $[0.0, 1.0]$.
* [x] Implement `Coordinates` value object with strict range validation (Lat: $[-90, 90]$, Long: $[-180, 180]$).
* [x] Implement `Vector` numerical array type.
* [x] Write domain unit tests to verify out-of-bound variables throw explicit exceptions.


* [x] **Task 1.2: Strict Output Directory Setup**
* [x] Create repository root directories: `/maps` and `/maps/images`.
* [x] Enforce read-only locks/guards on source data (`input.json`) to prevent accidental side effects.


## Phase 2: Ingestion & Schema Validation (`REQ-001`, `REQ-002`)

* [x] **Task 2.1: Schema Validation Engine**
* [x] Build parsing logic to ingest the raw `plants` JSON array.
* [x] Implement data-type validation (missing keys, malformed vectors).
* [x] Implement business-rule validation (e.g., latitude = 200).
* [x] Set up an error accumulator array to collect failed validation data without interrupting execution.


* [x] **Task 2.2: Invalid Records Serialization**
* [x] Map invalid records to include the original payload along with a descriptive `"error"` property.
* [x] Serialize accumulated errors to `maps/invalid_plants.json`.
* [x] Ensure `invalid_plants.json` is safely omitted or emptied if all input records are 100% valid.


## Phase 3: Mistral Small Description Pipeline (`REQ-003`)

* [x] **Task 3.1: Text Description Client & Prompt Assembly**
* [x] Write a dedicated HTTP client adapter targeting the Mistral Small API.
* [x] Design a deterministic prompt template using **only** `disease` and `confidence`.
* [x] *Anti-Pattern Guard:* Ensure `vector` data is completely stripped from the context payload sent to Mistral.


* [x] **Task 3.2: API Fault Tolerance & Safe Degradation**
* [x] Wrap the external API call in a robust try/catch layer.
* [x] Log network/LLM call timeouts or exceptions to system errors.
* [x] Implement a graceful fallback mapping an empty string (`""`) to `description` to ensure the asset pipeline does not break.


## Phase 4: Vector Heatmap Generation (`REQ-004`)

* [x] **Task 4.1: Vector Canvas Image Renderer**
* [x] Implement an explicit matrix-to-pixel transformation module (using a zero-external-dependency rendering solution).
* [x] Force rendering dimensions exactly to **256x256 pixels**.
* [x] Stream and save the static PNG files directly to `maps/images/{plantId}.png`.

* [x] **Task 4.2: Malformed Embedding Fallback**
* [x] Detect empty, missing, or corrupted embedding vector inputs.
* [x] Implement a safe-path generating a solid black 256x256 canvas image.
* [x] Emit a localized application warning log for tracking.


## Phase 5: Map Orchestration & HTML Compilation (`REQ-005` to `REQ-007`)

* [x] **Task 5.1: Leaflet Standalone Template Compiler**
* [x] Build a static boilerplate compiler for `global_map.html` using an OpenStreetMap tile layer configuration.
* [x] Inject native Leaflet client styles and scripts cleanly inside the output file headers.
* [x] Code a visually distinct UI legend defining color mappings for `Mildew`, `Powdery Mildew`, and `Healthy` statuses.


* [x] **Task 5.2: Map Layer Composition**
* [x] **Heatmap Layer:** Compute density clusters from coordinates of diseased items (`Mildew`, `Powdery Mildew`), mapping weight intensity $= 1.0$ per diseased plant.
* [x] **Marker Layer:** Mount standard Leaflet markers with click-activated **Popups** (disable mouse-over tooltips entirely).
* [x] Bind structured data safely inside the markup structure of the popup:
```html
<h3>Plant ID: {plantId}</h3>
<p><b>Diagnosis:</b> {disease} ({confidence}%)</p>
<p><i>Description:</i> {description}</p>
<img src="images/{plantId}.png" width="256" height="256" alt="Vector Heatmap" />

```
* [x] **Task 5.3: Empty State Boundary Handling**
* [x] Intercept instances where the number of valid plants parsed equals zero.
* [x] Bypass the full Leaflet orchestration and generate a fallback `maps/global_map.html` rendering exactly: `"No valid plants to display."`


* [x] **Task 5.4: CI/CD Target Deployment Resolver**
* [x] Package and finalize all compiled assets inside the `/maps` root directory.
* [x] Implement the path engine to dynamically resolve and return the public-facing URL: `https://github.com/<user>/<repo>/blob/main/maps/global_map.html`.
