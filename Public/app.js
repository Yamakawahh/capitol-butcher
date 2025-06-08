const form     = document.getElementById('poemForm');
const statusEl = document.getElementById('status');
const output   = document.getElementById('poemOutput');
const btn      = document.getElementById('submitBtn');
const review   = document.getElementById('reviewBtn');
review.style.display = 'none';

form.addEventListener('submit', async e => {
  e.preventDefault();
  review.style.display = 'none';
  statusEl.textContent = '✨ La surprise arrive…';
  output.textContent = '';
  btn.disabled = true;

  const res = await fetch('/api/generate-poem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('nameInput').value,
      quality: document.getElementById('qualityInput').value
    })
  });

  const data = await res.json();
  btn.disabled = false;

  if (res.ok) {
    statusEl.textContent = '';
    output.textContent = data.poem;          // protection XSS : textContent
    review.style.display = 'inline-block';
  } else {
    statusEl.innerHTML = `<span class="error">${data.error || 'Erreur inconnue.'}</span>`;
  }
});
