
function toggleCard(card) {
  card.classList.toggle('open');
  // Auto-scroll to the expanded card for mobile/long lists
  if (card.classList.contains('open')) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Make cards keyboard accessible
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard(card);
    }
  });
});

