// Récupération des éléments du DOM
const form     = document.getElementById('poemForm');
const statusEl = document.getElementById('status');
const output   = document.getElementById('poemOutput');
const btn      = document.getElementById('submitBtn');
const review   = document.getElementById('reviewBtn');

// Cacher le lien "Laisser un avis" dès que la page est chargée
document.addEventListener('DOMContentLoaded', () => {
  if (review) review.style.display = 'none';
});

form.addEventListener('submit', async e => {
  e.preventDefault();                 // Empêche le rechargement de la page
  if (review) review.style.display = 'none';
  statusEl.textContent = '✨ La surprise arrive…';
  output.textContent = '';
  btn.disabled = true;

  try {
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

    if (!res.ok || !data.poem) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    statusEl.textContent = '';
    output.textContent = data.poem;
    if (review) review.style.display = 'inline-block'; // Affiche le lien "Laisser un avis"
  } catch (err) {
    statusEl.innerHTML = `<span class="error">Erreur : ${err.message}</span>`;
    console.error('Erreur API :', err);
  }
});
