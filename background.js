// Liste des domaines suspects par défaut
const defaultSuspiciousDomains = [
  'casino',
  'bet',
  'porn',
  'xxx',
  'adult',
  'click',
  'redirect',
  'popup'
];

// Fonction pour vérifier si une URL est suspecte
function isSuspiciousUrl(url) {
  const lowerUrl = url.toLowerCase();
  
  return new Promise((resolve) => {
    chrome.storage.local.get(['blockedDomains'], function(result) {
      const blockedDomains = result.blockedDomains || [];
      
      // Vérifier d'abord les domaines bloqués personnalisés
      const isBlocked = blockedDomains.some(domain => lowerUrl.includes(domain));
      if (isBlocked) {
        resolve(true);
        return;
      }
      
      // Ensuite, vérifier les domaines suspects par défaut
      const isSuspicious = defaultSuspiciousDomains.some(domain => lowerUrl.includes(domain));
      resolve(isSuspicious);
    });
  });
}

// Fonction pour afficher une notification
function showNotification(domain) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon16.png',
    title: 'Redirection bloquée',
    message: `La redirection vers ${domain} a été bloquée`,
    priority: 2
  });
}

// Écouter les événements de navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Vérifier si la navigation est initiée par l'utilisateur
  if (details.frameId === 0 && details.parentFrameId === -1) {
    // Si l'URL est suspecte, on annule la navigation
    const suspicious = await isSuspiciousUrl(details.url);
    if (suspicious) {
      // Fermer l'onglet
      chrome.tabs.remove(details.tabId);
      
      // Afficher la notification
      const domain = new URL(details.url).hostname;
      showNotification(domain);
      
      return { cancel: true };
    }
  }
}, { url: [{ schemes: ['http', 'https'] }] }); 