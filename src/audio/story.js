// Helper for audio stories.
// Sets window.__metaPreviewData so the storybook-channel can send it to the
// relay, and returns an HTML string for Storybook's own preview.

export function audioStory(data) {
  window.__metaPreviewData = data;

  if (data.type === 'note') {
    return `<div class="audio-story note">
      <span class="note-name">${data.note}</span>
      <span class="note-meta">${data.duration ?? '4n'}</span>
    </div>`;
  }

  if (data.type === 'chord') {
    const pills = data.notes.map(n => `<span class="note-pill">${n}</span>`).join('');
    return `<div class="audio-story chord">
      <div class="notes-row">${pills}</div>
      <span class="note-meta">${data.duration ?? '2n'}</span>
    </div>`;
  }

  if (data.type === 'progression') {
    const steps = data.steps
      .map(s => {
        const pills = s.notes.map(n => `<span class="note-pill">${n}</span>`).join('');
        return `<div class="progression-step">${pills}</div>`;
      })
      .join('<span class="arrow">→</span>');
    return `<div class="audio-story progression">
      <div class="steps-row">${steps}</div>
      <span class="note-meta">${data.bpm ?? 120} bpm</span>
    </div>`;
  }

  return `<pre class="audio-story">${JSON.stringify(data, null, 2)}</pre>`;
}
