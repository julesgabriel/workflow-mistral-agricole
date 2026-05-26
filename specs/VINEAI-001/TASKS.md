An absolute pleasure, Jules. Here is the highly structured, actionable specification-driven development backlog formatted as a clean Markdown checklist. You can copy this directly into your tracking files or markdown notes.

# 📋 Vine AI (VINEAI-001) - Implementation Checklist

## Phase 1: Project Setup & Domain Modeling

* [ ] **Task 1.1: Core Domain Entities & Value Objects**
* [ ] Implement `PlantId` as a branded string type.
* [ ] Implement `Disease` enum (`Mildew`, `Powdery Mildew`, `Healthy`).
* [ ] Implement `Confidence` value object with strict bounds validation $[0.0, 1.0]$.
* [ ] Implement `Coordinates` value object with strict range validation (Lat: $[-90, 90]$, Long: $[-180, 180]$).
* [ ] Implement `Vector` numerical array type.
* [ ] Write domain unit tests to verify out-of-bound variables throw explicit exceptions.


* [ ] **Task 1.2: Strict Output Directory Setup**
* [ ] Create repository root directories: `/maps` and `/maps/images`.
* [ ] Enforce read-only locks/guards on source data (`input.json`) to prevent accidental side effects.



## Phase 2: Ingestion & Schema Validation (`REQ-001`, `REQ-002`)

* [ ] **Task 2.1: Schema Validation Engine**
* [ ] Build parsing logic to ingest the raw `plants` JSON array.
* [ ] Implement data-type validation (missing keys, malformed vectors).
* [ ] Implement business-rule validation (e.g., latitude = 200).
* [ ] Set up an error accumulator array to collect failed validation data without interrupting execution.


* [ ] **Task 2.2: Invalid Records Serialization**
* [ ] Map invalid records to include the original payload along with a descriptive `"error"` property.
* [ ] Serialize accumulated errors to `maps/invalid_plants.json`.
* [ ] Ensure `invalid_plants.json` is safely omitted or emptied if all input records are 100% valid.



## Phase 3: Mistral Small Description Pipeline (`REQ-003`)

* [ ] **Task 3.1: Text Description Client & Prompt Assembly**
* [ ] Write a dedicated HTTP client adapter targeting the Mistral Small API.
* [ ] Design a deterministic prompt template using **only** `disease` and `confidence`.
* [ ] *Anti-Pattern Guard:* Ensure `vector` data is completely stripped from the context payload sent to Mistral.


* [ ] **Task 3.2: API Fault Tolerance & Safe Degradation**
* [ ] Wrap the external API call in a robust try/catch layer.
* [ ] Log network/LLM call timeouts or exceptions to system errors.
* [ ] Implement a graceful fallback mapping an empty string (`""`) to `description` to ensure the asset pipeline does not break.



## Phase 4: Vector Heatmap Generation (`REQ-004`)

* [ ] **Task 4.1: Vector Canvas Image Renderer**
* [ ] Implement an explicit matrix-to-pixel transformation module (using a zero-external-dependency rendering solution).
* [ ] Force rendering dimensions exactly to **256x256 pixels**.
* [ ] Stream and save the static PNG files directly to `maps/images/{plantId}.png`.

* [ ] **Task 4.2: Malformed Embedding Fallback**
* [ ] Detect empty, missing, or corrupted embedding vector inputs.
* [ ] Implement a safe-path generating a solid black 256x256 canvas image.
* [ ] Emit a localized application warning log for tracking.


## Phase 5: Map Orchestration & HTML Compilation (`REQ-005` to `REQ-007`)

* [ ] **Task 5.1: Leaflet Standalone Template Compiler**
* [ ] Build a static boilerplate compiler for `global_map.html` using an OpenStreetMap tile layer configuration.
* [ ] Inject native Leaflet client styles and scripts cleanly inside the output file headers.
* [ ] Code a visually distinct UI legend defining color mappings for `Mildew`, `Powdery Mildew`, and `Healthy` statuses.


* [ ] **Task 5.2: Map Layer Composition**
* [ ] **Heatmap Layer:** Compute density clusters from coordinates of diseased items (`Mildew`, `Powdery Mildew`), mapping weight intensity $= 1.0$ per diseased plant.
* [ ] **Marker Layer:** Mount standard Leaflet markers with click-activated **Popups** (disable mouse-over tooltips entirely).
* [ ] Bind structured data safely inside the markup structure of the popup:
```html
<h3>Plant ID: {plantId}</h3>
<p><b>Diagnosis:</b> {disease} ({confidence}%)</p>
<p><i>Description:</i> {description}</p>
<img src="images/{plantId}.png" width="256" height="256" alt="Vector Heatmap" />

```
* [ ] **Task 5.3: Empty State Boundary Handling**
* [ ] Intercept instances where the number of valid plants parsed equals zero.
* [ ] Bypass the full Leaflet orchestration and generate a fallback `maps/global_map.html` rendering exactly: `"No valid plants to display."`


* [ ] **Task 5.4: CI/CD Target Deployment Resolver**
* [ ] Package and finalize all compiled assets inside the `/maps` root directory.
* [ ] Implement the path engine to dynamically resolve and return the public-facing URL: `https://github.com/<user>/<repo>/blob/main/maps/global_map.html`.