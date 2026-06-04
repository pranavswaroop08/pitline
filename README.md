# 🏁 Pitline

**Pitline** is a motorsport telemetry analytics platform designed for sim racers — inspired by fitness tracking platforms like Strava, but built for racing performance analysis.

It helps drivers upload telemetry data, analyze laps, compare performance, and understand where time is gained or lost on track.

---

# 🚀 Project Vision

Pitline turns raw racing telemetry into actionable insights.

Instead of guessing why a lap was slow, users can:

* Compare laps side-by-side
* Visualize racing lines
* Analyze speed, braking, and throttle behavior
* Identify performance bottlenecks

The goal is simple:

> Help sim racers improve using data, not intuition.

---

# 🎯 MVP Features

The current version focuses on a minimal but functional analytics pipeline:

### 📤 Telemetry Upload

* Upload CSV telemetry files from sim racing games
* Parse raw data into a standardized format

### 📊 Lap Visualization

* View speed over time graphs
* Analyze throttle and brake inputs
* Inspect gear and RPM changes

### ⚖️ Lap Comparison

* Compare two laps side-by-side
* Calculate delta (time/speed differences)
* Highlight performance gaps

### 🧠 Basic Insights Engine

* Rule-based analysis of braking and acceleration points
* Identify inconsistencies between laps

---

# 🧱 Core Concept

All telemetry is normalized into a single internal format:

```ts
TelemetryPoint {
  time: number
  x: number
  y: number
  speed: number
  throttle: number
  brake: number
  gear: number
  rpm: number
}
```

This ensures compatibility across different sim racing games.

---

# 🏗️ Architecture

Pitline follows a simple data pipeline architecture:

```
CSV Upload
   ↓
Parser Layer
   ↓
Normalization
   ↓
Lap Splitter
   ↓
Analytics Engine
   ↓
UI Visualization
```

The system is designed to be lightweight, fast, and easy to extend.

---

# 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), TypeScript
* **Styling:** Tailwind CSS, shadcn/ui
* **Charts:** Recharts
* **Backend:** Next.js API Routes
* **Storage:** In-memory (MVP stage)

Future versions may introduce PostgreSQL and object storage.

---

# 📁 Project Structure

```
/app              → UI pages (dashboard, upload, analysis)
/components       → Reusable UI components
/lib
  /telemetry      → Parsing + normalization logic
  /analytics      → Delta + performance calculations
  /visualization  → Graph + racing line rendering
/types            → TypeScript definitions
```

---

# 📈 Example Use Case

1. Upload a telemetry CSV from a sim race
2. System parses and splits laps
3. Select Lap A and Lap B
4. View:

   * Speed graph comparison
   * Brake/throttle differences
   * Time delta per section
5. Get insights like:

   * "You are braking too early in Turn 3"
   * "Better throttle application in exit of Turn 5"

---

# 🧠 Key Technical Challenges

* Normalizing telemetry from different simulators
* Splitting laps from continuous data streams
* Aligning laps with different lengths
* Rendering smooth racing line visualizations
* Turning raw data into meaningful insights

---

# 🛣️ Roadmap

### Phase 1 — MVP

* Upload telemetry
* Parse CSV
* View lap graphs
* Compare laps

### Phase 2 — Expansion

* Racing line visualization
* Session history
* Basic leaderboard system

### Phase 3 — Advanced Analytics

* AI coaching insights
* Sector analysis
* Setup vs performance correlation

---

# 📌 Status

🚧 Early-stage MVP in active development

Focus:

> Build a working telemetry analysis pipeline first, then expand features.

---

# 👨‍💻 Author

Built by Pranav Swaroop
Second-year Computer Science student
Focused on AI systems, automation, and data-driven applications

---

# ⭐ Goal

To build a portfolio-grade system that demonstrates:

* Full-stack engineering
* Data pipeline design
* Visualization systems
* Domain-specific analytics

---
