/**
 * BigQuery Release Notes — front-end logic.
 *
 * Fetches notes from the Flask API, renders cards, and provides
 * "Tweet about it" + expand/collapse functionality.
 */

const feedList     = document.getElementById('feed-list');
const btnRefresh   = document.getElementById('btn-refresh');
const noteCountEl  = document.getElementById('note-count');

/* ── helpers ──────────────────────────────────────────────── */

/** Classify an <h3> tag text into a CSS class for colouring. */
function tagClass(text) {
  const t = text.toLowerCase().trim();
  if (t === 'feature')       return 'tag-feature';
  if (t === 'announcement')  return 'tag-announcement';
  if (t === 'issue')         return 'tag-issue';
  if (t === 'breaking change' || t === 'breaking') return 'tag-breaking';
  if (t === 'deprecation')   return 'tag-deprecation';
  return 'tag-default';
}

/** Apply tag-* classes to all <h3> elements inside a container. */
function colourTags(container) {
  container.querySelectorAll('h3').forEach(h3 => {
    h3.className = tagClass(h3.textContent);
  });
}

/** Strip HTML tags and truncate to `max` characters. */
function plainText(html, max = 220) {
  const div = document.createElement('div');
  div.innerHTML = html;
  let text = div.textContent || div.innerText || '';
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > max) text = text.slice(0, max) + '…';
  return text;
}

/** Build a Twitter / X intent URL. */
function tweetUrl(note) {
  const summary = plainText(note.content, 180);
  const text = `📢 BigQuery update — ${note.date}\n\n${summary}\n\n${note.link}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/* ── rendering ────────────────────────────────────────────── */

function showLoading() {
  feedList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p class="loading-text">Fetching latest release notes…</p>
    </div>`;
}

function showError(msg) {
  feedList.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">${msg}</p>
      <button class="btn-refresh" onclick="loadNotes()">
        <span class="icon">↻</span> Retry
      </button>
    </div>`;
}

function renderNotes(notes) {
  noteCountEl.textContent = notes.length;
  feedList.innerHTML = '';

  notes.forEach((note, idx) => {
    const card = document.createElement('article');
    card.className = 'release-card';
    card.style.animationDelay = `${Math.min(idx * 0.03, 0.3)}s`;

    // Check if content is long enough to need expand
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const needsExpand = (tempDiv.textContent || '').length > 280;

    card.innerHTML = `
      <div class="card-header">
        <h2 class="card-date">${note.date}</h2>
        <div class="card-actions">
          <a class="btn-tweet"
             href="${tweetUrl(note)}"
             target="_blank"
             rel="noopener noreferrer"
             title="Post on X / Twitter">
            <span class="x-logo">𝕏</span> Post
          </a>
          <a class="btn-link"
             href="${note.link}"
             target="_blank"
             rel="noopener noreferrer"
             title="View on Google Cloud docs">
            ↗ Docs
          </a>
        </div>
      </div>
      <div class="card-content">${note.content}</div>
      ${needsExpand ? '<button class="btn-expand" data-expanded="false">Show more ▾</button>' : ''}
    `;

    // Colour the h3 tags
    colourTags(card);

    // Expand/collapse toggle
    const expandBtn = card.querySelector('.btn-expand');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        const content = card.querySelector('.card-content');
        const isExpanded = expandBtn.dataset.expanded === 'true';
        content.classList.toggle('expanded', !isExpanded);
        expandBtn.dataset.expanded = String(!isExpanded);
        expandBtn.textContent = isExpanded ? 'Show more ▾' : 'Show less ▴';
      });
    }

    feedList.appendChild(card);
  });
}

/* ── data fetching ────────────────────────────────────────── */

async function loadNotes() {
  btnRefresh.classList.add('loading');
  btnRefresh.disabled = true;
  showLoading();

  try {
    const res  = await fetch('/api/notes');
    const data = await res.json();

    if (data.status !== 'ok') throw new Error(data.message || 'Unknown error');

    renderNotes(data.notes);
  } catch (err) {
    showError(err.message);
  } finally {
    btnRefresh.classList.remove('loading');
    btnRefresh.disabled = false;
  }
}

/* ── init ─────────────────────────────────────────────────── */

btnRefresh.addEventListener('click', loadNotes);
loadNotes();
