"""Flask application that serves BigQuery release notes from Google's Atom feed."""

import xml.etree.ElementTree as ET
from datetime import datetime

import requests
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
ATOM_NS = "{http://www.w3.org/2005/Atom}"


def fetch_release_notes():
    """Fetch and parse the BigQuery release notes XML feed."""
    response = requests.get(FEED_URL, timeout=15)
    response.raise_for_status()

    root = ET.fromstring(response.content)
    entries = []

    for entry in root.findall(f"{ATOM_NS}entry"):
        title = entry.find(f"{ATOM_NS}title")
        updated = entry.find(f"{ATOM_NS}updated")
        link = entry.find(f"{ATOM_NS}link")
        content = entry.find(f"{ATOM_NS}content")

        # Parse date for sorting/display
        date_str = updated.text if updated is not None else ""
        try:
            parsed_date = datetime.fromisoformat(date_str)
            display_date = parsed_date.strftime("%B %d, %Y")
        except (ValueError, TypeError):
            display_date = title.text if title is not None else "Unknown"

        entries.append(
            {
                "title": title.text if title is not None else "Untitled",
                "date": display_date,
                "iso_date": date_str,
                "link": link.get("href", "") if link is not None else "",
                "content": content.text if content is not None else "",
            }
        )

    return entries


@app.route("/")
def index():
    """Serve the main page."""
    return render_template("index.html")


@app.route("/api/notes")
def get_notes():
    """API endpoint to fetch release notes."""
    try:
        notes = fetch_release_notes()
        return jsonify({"status": "ok", "notes": notes})
    except requests.RequestException as e:
        return jsonify({"status": "error", "message": str(e)}), 502
    except ET.ParseError as e:
        return jsonify({"status": "error", "message": f"XML parse error: {e}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
