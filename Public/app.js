// Récupération des éléments du DOM
const form     = document.getElementById('poemForm');
const statusEl = document.getElementById('status');
const output   = document.getElementById('poemOutput');
const btn      = document.getElementById('submitBtn');
const review   = document.getElementById('reviewBtn');

// Cacher le bouton "Laisser un avis" dès que la page est chargée
document.addEventListener('DOMContentLoaded', () => {
  if (review) review.style.display = 'none';
});

form.addEventListener('submit', async e => {
  e.preventDefault();                 // Empêche le rechargement de la page

  // Préparation de l'affichage
  if (review) review.style.display = 'none';
  statusEl.textContent = '✨ La surprise arrive…';
  output.textContent = '';
  btn.disabled = true;

  // Récupération des champs
  const name    = document.getElementById('nameInput').value;
  const quality = document.getElementById('qualityInput').value;

  // Envoi de la requête à l'API
  const res = await fetch('/api/generate-poem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, quality })
  });

  const data = await res.json();
  btn.disabled = false;

  if (res.ok) {
    statusEl.textContent = '';
    output.textContent = data.poem;
    if (review) review.style.display = 'inline-block'; // Affiche le bouton "Laisser un avis"
  } else {
    statusEl.innerHTML = `<span class="error">${data.error || 'Erreur inconnue.'}</span>`;
  }
});
