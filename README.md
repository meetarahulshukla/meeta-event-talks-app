# ⚡ BigQuery Release Notes

A sleek, dark-themed web dashboard that fetches the latest [Google BigQuery release notes](https://cloud.google.com/bigquery/docs/release-notes) and lets you share updates on X / Twitter with a single click.

Built with **Python Flask** on the backend and **vanilla HTML, CSS & JavaScript** on the frontend.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Live Feed** | Pulls the official BigQuery Atom XML feed from Google Cloud and parses it into structured JSON |
| **Refresh** | One-click refresh button with an animated spinner |
| **Release Cards** | Each release date is displayed as a styled card with the full HTML content from Google |
| **Tag Colouring** | Headings like `Feature`, `Announcement`, `Issue`, and `Deprecation` are auto-detected and colour-coded |
| **Expand / Collapse** | Long entries are truncated with a gradient fade; toggle to reveal full text |
| **Tweet / Post on X** | Pre-filled Twitter intent URL — share any update in seconds |
| **Docs Link** | Direct link to the corresponding Google Cloud documentation page |

---

## 🏗️ Architecture

```
Browser                        Flask Server                  Google Cloud
───────                        ────────────                  ────────────
  │                                │                              │
  │──── GET / ────────────────────▶│                              │
  │◀─── index.html ───────────────│                              │
  │                                │                              │
  │──── GET /api/notes ──────────▶│                              │
  │                                │──── GET XML feed ──────────▶│
  │                                │◀─── Atom XML ───────────────│
  │                                │     (parse & convert)        │
  │◀─── JSON response ───────────│                              │
  │     (render cards)             │                              │
```

Flask acts as a **CORS proxy** — the browser cannot fetch Google's XML feed directly due to cross-origin restrictions, so the server fetches and parses it on behalf of the client.

---

## 📁 Project Structure

```
bq-release-notes/
├── app.py                  # Flask server — routes + XML parser
├── requirements.txt        # Python dependencies
├── .gitignore
├── static/
│   ├── style.css           # Dark-mode styling, animations, design tokens
│   └── app.js              # Client-side fetch, render, and tweet logic
└── templates/
    └── index.html          # Single-page HTML template
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/meetarahulshukla/meeta-event-talks-app.git
cd meeta-event-talks-app

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Open **http://127.0.0.1:5000** in your browser.

---

## 🔌 API

### `GET /api/notes`

Returns the parsed release notes as JSON.

**Success Response (200):**

```json
{
  "status": "ok",
  "notes": [
    {
      "title": "June 17, 2026",
      "date": "June 17, 2026",
      "iso_date": "2026-06-17T00:00:00-07:00",
      "link": "https://docs.google.com/bigquery/docs/release-notes#June_17_2026",
      "content": "<h3>Feature</h3><p>You can enable autonomous embedding..."
    }
  ]
}
```

**Error Response (502):**

```json
{
  "status": "error",
  "message": "Connection timed out"
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3, Flask, requests, xml.etree.ElementTree |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| **Data Source** | [BigQuery Atom Feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
