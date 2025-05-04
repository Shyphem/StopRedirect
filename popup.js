// Fonction pour extraire le domaine d'une URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// Fonction pour valider une URL
function isValidUrl(url) {
  try {
    // Si l'URL ne commence pas par http:// ou https://, on l'ajoute
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Fonction pour mettre à jour la liste des sites bloqués
function updateBlockedList() {
  chrome.storage.local.get(['blockedDomains'], function(result) {
    const blockedList = document.getElementById('blockedList');
    blockedList.innerHTML = '';
    
    const blockedDomains = result.blockedDomains || [];
    
    blockedDomains.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'blocked-item';
      
      const domainSpan = document.createElement('span');
      domainSpan.textContent = domain;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-btn';
      removeButton.textContent = 'Supprimer';
      removeButton.onclick = () => removeDomain(domain);
      
      item.appendChild(domainSpan);
      item.appendChild(removeButton);
      blockedList.appendChild(item);
    });
  });
}

// Fonction pour ajouter un domaine à la liste des bloqués
function addDomain(domain) {
  chrome.storage.local.get(['blockedDomains'], function(result) {
    const blockedDomains = result.blockedDomains || [];
    if (!blockedDomains.includes(domain)) {
      blockedDomains.push(domain);
      chrome.storage.local.set({ blockedDomains }, function() {
        updateBlockedList();
      });
    }
  });
}

// Fonction pour supprimer un domaine de la liste des bloqués
function removeDomain(domain) {
  chrome.storage.local.get(['blockedDomains'], function(result) {
    const blockedDomains = result.blockedDomains || [];
    const newBlockedDomains = blockedDomains.filter(d => d !== domain);
    chrome.storage.local.set({ blockedDomains: newBlockedDomains }, function() {
      updateBlockedList();
    });
  });
}

// Fonction pour gérer l'ajout manuel d'une URL
function handleManualAdd() {
  const input = document.getElementById('manualUrl');
  const errorMessage = document.getElementById('errorMessage');
  const url = input.value.trim();

  if (!url) {
    errorMessage.textContent = 'Veuillez entrer une URL';
    errorMessage.style.display = 'block';
    return;
  }

  if (!isValidUrl(url)) {
    errorMessage.textContent = 'URL invalide';
    errorMessage.style.display = 'block';
    return;
  }

  const domain = getDomain(url);
  addDomain(domain);
  input.value = '';
  errorMessage.style.display = 'none';
}

// Fonction pour gérer le thème
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  
  // Charger le thème sauvegardé
  chrome.storage.local.get(['darkTheme'], function(result) {
    if (result.darkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.checked = true;
    }
  });

  // Gérer le changement de thème
  themeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      chrome.storage.local.set({ darkTheme: true });
    } else {
      document.documentElement.removeAttribute('data-theme');
      chrome.storage.local.set({ darkTheme: false });
    }
  });
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser le thème
  initTheme();

  // Afficher l'URL actuelle
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    document.getElementById('currentUrl').textContent = getDomain(currentUrl);
    
    // Configurer le bouton de blocage
    document.getElementById('blockCurrent').addEventListener('click', function() {
      addDomain(getDomain(currentUrl));
    });
  });

  // Configurer le bouton d'ajout manuel
  document.getElementById('addManual').addEventListener('click', handleManualAdd);
  
  // Permettre l'ajout avec la touche Entrée
  document.getElementById('manualUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleManualAdd();
    }
  });
  
  // Mettre à jour la liste des sites bloqués
  updateBlockedList();
}); 