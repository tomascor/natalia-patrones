// firebase-sync.js
// Sincronización de datos con Firebase Firestore

let db = null;
let userId = null;

// Inicializar Firebase
function initFirebase() {
  if (typeof firebaseConfig === 'undefined' || firebaseConfig.apiKey === 'TU_API_KEY') {
    console.log('Firebase no configurado, usando solo localStorage');
    return false;
  }

  try {
    // Cargar scripts de Firebase dinámicamente
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js';
    document.head.appendChild(script1);

    script1.onload = function() {
      const script2 = document.createElement('script');
      script2.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js';
      document.head.appendChild(script2);

      script2.onload = function() {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();

        // Generar o cargar ID de usuario
        userId = localStorage.getItem('misPatrones_userId');
        if (!userId) {
          userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('misPatrones_userId', userId);
        }

        console.log('Firebase inicializado. UserID:', userId);
        syncFromFirebase();
      };
    };

    return true;
  } catch (error) {
    console.error('Error inicializando Firebase:', error);
    return false;
  }
}

// Sincronizar DESDE Firebase (cargar)
async function syncFromFirebase() {
  if (!db || !userId) return;

  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();

      // Merge con localStorage existente (localStorage tiene prioridad local)
      const localProps = JSON.parse(localStorage.getItem('misPatrones_properties') || '{}');
      const localFavs = JSON.parse(localStorage.getItem('misPatrones_favorites') || '[]');
      const localCats = JSON.parse(localStorage.getItem('misPatrones_customCategories') || '[]');
      const localDeleted = JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]');

      // Firebase como base, localStorage sobreescribe si tiene más datos
      const mergedProps = { ...data.properties, ...localProps };
      const mergedFavs = [...new Set([...(data.favorites || []), ...localFavs])];
      const mergedCats = data.customCategories || localCats;
      const mergedDeleted = data.deletedDefaults || localDeleted;

      localStorage.setItem('misPatrones_properties', JSON.stringify(mergedProps));
      localStorage.setItem('misPatrones_favorites', JSON.stringify(mergedFavs));
      localStorage.setItem('misPatrones_customCategories', JSON.stringify(mergedCats));
      localStorage.setItem('misPatrones_deletedDefaults', JSON.stringify(mergedDeleted));

      // Guardar merge de vuelta a Firebase
      await syncToFirebase();

      console.log('Datos sincronizados desde Firebase');
    }
  } catch (error) {
    console.error('Error leyendo de Firebase:', error);
  }
}

// Sincronizar HACIA Firebase (guardar)
async function syncToFirebase() {
  if (!db || !userId) return;

  try {
    const data = {
      properties: JSON.parse(localStorage.getItem('misPatrones_properties') || '{}'),
      favorites: JSON.parse(localStorage.getItem('misPatrones_favorites') || '[]'),
      customCategories: JSON.parse(localStorage.getItem('misPatrones_customCategories') || '[]'),
      deletedDefaults: JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]'),
      lastSync: new Date().toISOString()
    };

    await db.collection('users').doc(userId).set(data);
    console.log('Datos guardados en Firebase');
  } catch (error) {
    console.error('Error guardando en Firebase:', error);
  }
}

// Guardar propiedades y sincronizar
function savePatternPropertiesAndSync() {
  savePatternProperties();
  syncToFirebase();
}

// Guardar favoritos y sincronizar
function saveFavoritesAndSync() {
  saveFavorites();
  syncToFirebase();
}

// Guardar categorías custom y sincronizar
function saveCustomCategoriesAndSync() {
  syncToFirebase();
}
