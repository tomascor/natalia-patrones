// firebase-sync.js
// Sincronización de datos con Firebase Firestore

let db = null;
const SHARED_DOC = 'shared-data';
let firebaseReady = false;

function initFirebase() {
  return new Promise((resolve) => {
    if (typeof firebaseConfig === 'undefined' || firebaseConfig.apiKey === 'TU_API_KEY') {
      console.log('Firebase no configurado, usando solo localStorage');
      resolve(false);
      return;
    }

    try {
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
          firebaseReady = true;
          console.log('Firebase OK');
          resolve(true);
        };
      };

      script1.onerror = function() {
        console.log('Error cargando Firebase, usando solo localStorage');
        resolve(false);
      };
    } catch (error) {
      console.error('Error Firebase:', error);
      resolve(false);
    }
  });
}

async function syncFromFirebase() {
  if (!db) return;

  try {
    const doc = await db.collection('app').doc(SHARED_DOC).get();
    if (doc.exists) {
      const data = doc.data();

      const localProps = JSON.parse(localStorage.getItem('misPatrones_properties') || '{}');
      const localFavs = JSON.parse(localStorage.getItem('misPatrones_favorites') || '[]');
      const localCats = JSON.parse(localStorage.getItem('misPatrones_customCategories') || '[]');
      const localDeleted = JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]');

      const mergedProps = {};
      const allIds = new Set([...Object.keys(data.properties || {}), ...Object.keys(localProps)]);
      allIds.forEach(id => {
        const fb = (data.properties || {})[id] || {};
        const local = localProps[id] || {};
        mergedProps[id] = {
          category: fb.category || local.category || '',
          tags: fb.tags || local.tags || '',
          notes: fb.notes || local.notes || ''
        };
      });

      const mergedFavs = [...new Set([...(data.favorites || []), ...localFavs])];
      const mergedCats = (data.customCategories && data.customCategories.length > 0) ? data.customCategories : localCats;
      const mergedDeleted = (data.deletedDefaults && data.deletedDefaults.length > 0) ? data.deletedDefaults : localDeleted;

      localStorage.setItem('misPatrones_properties', JSON.stringify(mergedProps));
      localStorage.setItem('misPatrones_favorites', JSON.stringify(mergedFavs));
      localStorage.setItem('misPatrones_customCategories', JSON.stringify(mergedCats));
      localStorage.setItem('misPatrones_deletedDefaults', JSON.stringify(mergedDeleted));

      console.log('Datos cargados desde Firebase');
    }
  } catch (error) {
    console.error('Error leyendo Firebase:', error);
  }
}

async function syncToFirebase() {
  if (!db) return;

  try {
    const data = {
      properties: JSON.parse(localStorage.getItem('misPatrones_properties') || '{}'),
      favorites: JSON.parse(localStorage.getItem('misPatrones_favorites') || '[]'),
      customCategories: JSON.parse(localStorage.getItem('misPatrones_customCategories') || '[]'),
      deletedDefaults: JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]'),
      lastSync: new Date().toISOString()
    };

    await db.collection('app').doc(SHARED_DOC).set(data);
    console.log('Guardado en Firebase');
  } catch (error) {
    console.error('Error guardando Firebase:', error);
  }
}
