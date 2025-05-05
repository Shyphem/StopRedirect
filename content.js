// Fonction pour vérifier si un lien est suspect
function isSuspiciousLink(href) {
  if (!href) return false;
  
  const suspiciousPatterns = [
    /redirect/i,
    /popup/i,
    /click/i,
    /track/i,
    /ad/i,
    /sponsor/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(href));
}

// Intercepter les clics sur les liens
document.addEventListener('click', (event) => {
  let target = event.target;
  
  // Remonter jusqu'à trouver un élément <a>
  while (target && target.tagName !== 'A') {
    target = target.parentElement;
  }

  if (target && target.tagName === 'A') {
    const href = target.getAttribute('href');
    
    // Si le lien est suspect, empêcher la navigation
    if (isSuspiciousLink(href)) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Redirection suspecte bloquée:', href);
    }
  }
}, true); 