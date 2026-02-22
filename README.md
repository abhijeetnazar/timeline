# Timeline Pro 🚀

Timeline Pro is a high-performance, interactive, and visually stunning chronological visualization engine. Built with React and TypeScript, it empowers users to transform complex event data into beautiful, professional-grade timelines. 

Whether you're documenting historical eras, managing project milestones, or visualizing personal stories, Timeline Pro provides a modern, responsive interface with professional export capabilities.

---

## ✨ Key Features

### 🎨 Visual & Interactive Design
- **Interactive Canvas:** Smooth, high-performance zooming (mouse wheel) and horizontal panning (click and drag).
- **Dual-Layer Positioning:** Categorize events by placing them **Above** or **Below** a central timeline axis.
- **Dynamic Grid & Axis:** Time markers (dots) and labels automatically scale from **Days** to **Decades** based on zoom level.
- **Stacked Layering:** Intelligent event stacking ensures no overlaps even in dense chronological periods.
- **Connector System:** Color-coded vertical connectors link every event card directly to its point on the timeline.

### 🌓 Personalization
- **10 Curated Themes:** Instantly switch between 5 Dark and 5 Light themes (e.g., Midnight, Dracula, Nordic, Pure Snow, Ocean Breeze).
- **Individual Event Scaling:** Highlight key moments by scaling individual event cards from **0.5x to 2.0x**.
- **Canvas Toggles:** Hide or show event names and dates directly on the timeline for a cleaner look.

### 📤 Data & Export
- **4K High-Res Export:** Capture your entire story (from first event to last) as a pixel-perfect PNG in **Ultra-HD resolution**.
- **Google Sheets Sync:** Pull data directly from a public Google Sheet (published as CSV).
- **JSON Import/Export:** Save your work as local files for manual backups or sharing.
- **Local Persistence:** Automatic browser-based storage (LocalStorage) keeps your data safe across sessions.

---

## 🛠️ Project Architecture

```text
timeline/
├── src/
│   ├── components/
│   │   ├── Timeline.tsx      # Main visualization engine & canvas
│   │   └── EventModal.tsx    # Event creation & editing interface
│   ├── themes.ts             # Theme definitions & color schemes
│   ├── types.ts              # TypeScript interfaces & data models
│   ├── utils.ts              # Export/Import logic & data parsers
│   ├── App.tsx               # Global state, sidebar, & theme management
│   └── App.css               # Core styles & layout (Vanilla CSS)
├── Dockerfile                # Production multi-stage build
├── docker-compose.yml        # Orchestration for port 8080
└── package.json              # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18.0 or higher
- **NPM:** v9.0 or higher
- **Docker:** (Optional) for containerized deployment

### Installation
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd timeline
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start development server:**
   ```bash
   npm run dev
   ```
   *The app will be available at: `http://localhost:5173/`*

---

## 🐳 Docker Deployment

### Local Docker Build
1. **Start the container:**
   ```bash
   docker-compose up -d --build
   ```
2. **Access the application:**
   The application is exposed on **port 8080** by default.
   URL: `http://localhost:8080`

### Multi-Stage Build Details
The provided `Dockerfile` uses a two-stage process:
- **Build Stage:** Compiles the React/TypeScript app using Node.js.
- **Production Stage:** Serves the static `dist/` folder using a lightweight Nginx server for maximum performance.

---

## ☁️ Cloud Deployment Guides

### 1. Vercel (Front-end only)
- Connect your GitHub repository to [Vercel](https://vercel.com).
- Framework Preset: **Vite**.
- Output Directory: `dist`.
- Deployment is automatic on every `git push`.

### 2. Google Cloud Run (Full Container)
1. **Push to Google Container Registry:**
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/timeline-pro
   ```
2. **Deploy Service:**
   ```bash
   gcloud run deploy timeline-pro \
     --image gcr.io/[PROJECT_ID]/timeline-pro \
     --platform managed \
     --allow-unauthenticated
   ```

---

## 📊 Google Sheets Integration

To import data, your Google Sheet must be accessible via a CSV link.

1. **Setup Headers:** Your first row must contain these headers (order doesn't matter):
   - `title` (Required)
   - `start date` (Required, Format: `YYYY-MM-DD`)
   - `end date` (Optional, Format: `YYYY-MM-DD`)
   - `description` (Optional)
   - `category` (Optional)
   - `color` (Optional, e.g., `#ff0000`)
   - `image` (Optional, URL)
   - `position` (Optional, `above` or `below`)
   - `scale` (Optional, e.g., `1.5`)
2. **Publish:** Go to **File > Share > Publish to web**.
3. **Format:** Select **Comma-separated values (.csv)**.
4. **Link:** Copy the ID from the generated link (the string between `/d/` and `/pub`).

---

## 🎨 Adding Custom Themes

You can easily add more themes by modifying `src/themes.ts`. Add a new object to the `themes` array:

```typescript
{
  id: 'my-custom-theme',
  name: 'Ocean Depth',
  isDark: true,
  bg: '#001a2c',
  sidebar: '#002b49',
  card: 'rgba(255, 255, 255, 0.1)',
  text: '#ffffff',
  textMuted: '#8899a6',
  accent: '#0070f3',
  border: 'rgba(255, 255, 255, 0.1)'
}
```

---

## 📝 Roadmap
- [ ] Keyboard shortcuts for navigation (Space for pan, etc.)
- [ ] Mobile-responsive sidebar and touch-friendly canvas
- [ ] Multi-category filtering in the sidebar
- [ ] Collaborative editing via WebSockets

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
