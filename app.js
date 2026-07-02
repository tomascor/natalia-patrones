/* ============================================
   MIS PATRONES - Biblioteca de tejido
   JavaScript vanilla completo
   ============================================ */

// ===== ESTADO DE LA APLICACIÓN =====
const state = {
  patterns: [],           // Todos los patrones cargados
  filteredPatterns: [],   // Patrones filtrados
  megaLinks: {},          // Enlaces MEGA por diseñador
  favorites: [],          // IDs de favoritos (localStorage)
  currentView: 'grid',    // 'grid' o 'list'
  showFavoritesOnly: false, // Modo solo favoritos
  currentPreviewId: null, // ID del patrón en vista previa
  selectedCategory: '',   // Categoría seleccionada
  debounceTimer: null     // Timer para debounce
};

// ===== DATOS DE EJEMPLO (fallback si no existe data.json) =====
const SAMPLE_DATA = {
  patterns: [
    { id: 1, designer: "Isabell Kraemer", category: "Sweater", filename: "flax-sweater.pdf", name: "Flax Sweater", language: "EN", path: "", folder: "Isabell Kraemer" },
    { id: 2, designer: "Isabell Kraemer", category: "Sweater", filename: "sunday-sweater.pdf", name: "Sunday Sweater", language: "EN", path: "", folder: "Isabell Kraemer" },
    { id: 3, designer: "Isabell Kraemer", category: "Sweater", filename: "everyday-sweater.pdf", name: "Everyday Sweater", language: "EN", path: "", folder: "Isabell Kraemer" },
    { id: 4, designer: "PetiteKnit", category: "Sweater", filename: "monday-sweater.pdf", name: "Monday Sweater", language: "EN", path: "", folder: "PetiteKnit" },
    { id: 5, designer: "PetiteKnit", category: "Sweater", filename: "weekend-slipover.pdf", name: "Weekend Slipover", language: "EN", path: "", folder: "PetiteKnit" },
    { id: 6, designer: "PetiteKnit", category: "Cardigan", filename: "novice-cardigan.pdf", name: "Novice Cardigan", language: "EN", path: "", folder: "PetiteKnit" },
    { id: 7, designer: "Joji Locatelli", category: "Chal", filename: "faded.pdf", name: "Faded", language: "EN", path: "", folder: "Joji Locatelli" },
    { id: 8, designer: "Joji Locatelli", category: "Otro", filename: "the-velvet-deer.pdf", name: "The Velvet Deer", language: "EN", path: "", folder: "Joji Locatelli" },
    { id: 9, designer: "Stephen West", category: "Chal", filename: "dotted-pearls-mittens.pdf", name: "The Dotted Pearls Mittens", language: "EN", path: "", folder: "Stephen West" },
    { id: 10, designer: "Stephen West", category: "Sweater", filename: "exploring-stripe.pdf", name: "Exploring Stripe", language: "EN", path: "", folder: "Stephen West" },
    { id: 11, designer: "Belén Fernández", category: "Chal", filename: "suenos-de-lana.pdf", name: "Sueños de Lana", language: "ES", path: "", folder: "Belén Fernández" },
    { id: 12, designer: "Lucía Ruiz de Aguirre", category: "Top", filename: "top-pirita.pdf", name: "Top Pirita", language: "ES", path: "", folder: "Lucía Ruiz de Aguirre" },
    { id: 13, designer: "Claudia Quintanilla", category: "Sweater", filename: "comfort-sweater.pdf", name: "Comfort Sweater", language: "ES", path: "", folder: "Claudia Quintanilla" },
    { id: 14, designer: "Juana Roman", category: "Gorro", filename: "gorrio-beanie.pdf", name: "Gorrio Beanie", language: "ES", path: "", folder: "Juana Roman" },
    { id: 15, designer: "Susanne Müller", category: "Calcetines", filename: "vanilla-socks.pdf", name: "Vanilla Socks", language: "DE", path: "", folder: "Susanne Müller" },
    { id: 16, designer: "Mette-Wendelboe Okkels", category: "Cardigan", filename: "hygge-cardigan.pdf", name: "Hygge Cardigan", language: "EN", path: "", folder: "Mette-Wendelboe Okkels" },
    { id: 17, designer: "Pope Vergara", category: "Top", filename: "top-mariposa.pdf", name: "Top Mariposa", language: "ES", path: "", folder: "Pope Vergara" },
    { id: 18, designer: "Aitana Villa", category: "Chal", filename: "sagrada-familia-shawl.pdf", name: "Sagrada Familia Shawl", language: "ES", path: "", folder: "Aitana Villa" },
    { id: 19, designer: "Aitana Villa", category: "Chal", filename: "sororidad-shawl.pdf", name: "Sororidad Shawl", language: "ES", path: "", folder: "Aitana Villa" },
    { id: 20, designer: "Ambah O'Brien", category: "Cardigan", filename: "celestia-cardigan.pdf", name: "Celestia Cardigan", language: "EN", path: "", folder: "Ambah O'Brien" }
  ]
};

// ===== MAPA DE CATEGORÍAS A EMOJIS =====
const CATEGORY_EMOJIS = {
  'Sweater': '🧶',
  'Cardigan': '🧥',
  'Chal': '🧣',
  'Top': '👕',
  'Gorro': '🧢',
  'Calcetines': '🧦',
  'Amigurumi': '🧸',
  'Mitones': '🧤',
  'Bufanda': '🧣',
  'Cuello': '🧣',
  'Vestido': '👗',
  'Bordado': '🪡',
  'Otro': '📄'
};

// ===== MAPA DE IDIOMAS A BANDERAS =====
const LANGUAGE_FLAGS = {
  'ES': '🇪🇸',
  'EN': '🇬🇧',
  'DE': '🇩🇪',
  'PT': '🇵🇹',
  'FR': '🇫🇷',
  'RU': '🇷🇺'
};

const LANGUAGE_NAMES = {
  'ES': 'Español',
  'EN': 'Inglés',
  'DE': 'Alemán',
  'PT': 'Portugués',
  'FR': 'Francés',
  'RU': 'Ruso'
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // 1. Esperar a que Firebase cargue y sincronice datos ANTES de leer localStorage
  if (typeof initFirebase === 'function') {
    await initFirebase();
    if (typeof syncFromFirebase === 'function') {
      await syncFromFirebase();
    }
  }

  // 2. AHORA sí: cargar de localStorage (ya tiene datos de Firebase)
  loadFavorites();

  // Mostrar skeleton loading
  showSkeletons();

  // Cargar datos
  await Promise.all([loadPatterns(), loadMegaLinks]);

  // Aplicar propiedades guardadas (categoría, etiquetas, notas)
  applySavedProperties();

  // Poblar filtros
  populateFilters();

  // Renderizar tarjetas
  applyFilters();

  // Configurar eventos
  setupEventListeners();

  // Actualizar UI
  updateFavCount();
  updateDeleteSection();

  // Marcar app como lista (permite syncToFirebase)
  appReady = true;
  window.__READY = true;
}

// ===== CARGA DE DATOS =====
async function loadPatterns() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('No se pudo cargar data.json');
    const data = await response.json();
    state.patterns = data.patterns || [];
  } catch (error) {
    console.warn('Usando datos de ejemplo:', error.message);
    state.patterns = SAMPLE_DATA.patterns;
  }
}

async function loadMegaLinks() {
  try {
    const response = await fetch('mega-links.json');
    if (!response.ok) throw new Error('No se pudo cargar mega-links.json');
    const data = await response.json();
    state.megaLinks = data.designers || {};
  } catch (error) {
    console.warn('No se encontraron enlaces MEGA:', error.message);
    state.megaLinks = {};
  }
}

// ===== SKELETON LOADING =====
function showSkeletons() {
  const grid = document.getElementById('skeletonGrid');
  let html = '';
  for (let i = 0; i < 8; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-body">
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>`;
  }
  grid.innerHTML = html;
}

function hideSkeletons() {
  document.getElementById('skeletonGrid').innerHTML = '';
}

// ===== POBLAR FILTROS =====
function populateFilters() {
  // Diseñadores únicos (ordenados alfabéticamente)
  const designers = [...new Set(state.patterns.map(p => p.designer))].sort();
  const designerSelect = document.getElementById('designerFilter');
  designers.forEach(d => {
    const count = state.patterns.filter(p => p.designer === d).length;
    const option = document.createElement('option');
    option.value = d;
    option.textContent = `${d} (${count})`;
    designerSelect.appendChild(option);
  });

  // Categorías únicas (ordenadas por cantidad)
  const categoryCounts = {};
  state.patterns.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  // Usar getAllCategories() para obtener iconos de categorías custom
  const allCats = getAllCategories();
  
  const tagsContainer = document.getElementById('categoryTags');
  let tagsHtml = '<button class="tag active" onclick="selectCategory(\'\')">Todos</button>';
  categories.forEach(cat => {
    const emoji = allCats[cat] || '📄';
    tagsHtml += `<button class="tag" onclick="selectCategory('${cat}')">${emoji} ${cat}</button>`;
  });
  tagsContainer.innerHTML = tagsHtml;

  // Actualizar estadísticas
  document.getElementById('totalStats').textContent = `${state.patterns.length} patrones`;
  document.getElementById('footerTotal').textContent = state.patterns.length;
  document.getElementById('footerDesigners').textContent = designers.length;
}

// ===== FILTROS =====
function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  const designerFilter = document.getElementById('designerFilter').value;
  const category = state.selectedCategory;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;
  const dateSort = document.getElementById('dateSort').value;

  state.filteredPatterns = state.patterns.filter(pattern => {
    // Filtro de búsqueda
    if (searchTerm) {
      const tags = getPatternTags(pattern.id).toLowerCase();
      const searchable = `${pattern.name} ${pattern.designer} ${pattern.category} ${tags}`.toLowerCase();
      if (!searchable.includes(searchTerm)) return false;
    }

    // Filtro de diseñador
    if (designerFilter && pattern.designer !== designerFilter) return false;

    // Filtro de categoría
    if (category && pattern.category !== category) return false;

    // Filtro de fecha desde
    if (dateFrom && pattern.date && pattern.date < dateFrom) return false;

    // Filtro de fecha hasta
    if (dateTo && pattern.date && pattern.date > dateTo) return false;

    // Modo favoritos
    if (state.showFavoritesOnly && !state.favorites.includes(pattern.id)) return false;

    return true;
  });

  // Ordenar por fecha
  if (dateSort === 'asc') {
    state.filteredPatterns.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  } else if (dateSort === 'desc') {
    state.filteredPatterns.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  // Actualizar UI
  hideSkeletons();
  renderPatterns();
  updateResultCount();
  updateToolbarTitle();
}

function selectCategory(category) {
  state.selectedCategory = category;

  // Actualizar tags activos
  document.querySelectorAll('#categoryTags .tag').forEach(tag => {
    tag.classList.remove('active');
    if (tag.textContent.includes('Todos') && !category) {
      tag.classList.add('active');
    } else if (tag.textContent.includes(category)) {
      tag.classList.add('active');
    }
  });

  applyFilters();
}

function clearAllFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('designerFilter').value = '';
  document.getElementById('designerSearch').value = '';
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';
  document.getElementById('dateSort').value = '';
  state.selectedCategory = '';
  state.showFavoritesOnly = false;

  // Resetear tags
  document.querySelectorAll('#categoryTags .tag').forEach((tag, i) => {
    tag.classList.toggle('active', i === 0);
  });

  // Resetear botón favoritos
  document.getElementById('btnFavorites').classList.remove('active');

  // Resetear select de diseñador
  resetDesignerOptions();

  applyFilters();
}

function resetDesignerOptions() {
  const select = document.getElementById('designerFilter');
  const options = select.querySelectorAll('option');
  options.forEach(opt => opt.style.display = '');
}

function filterDesignerOptions() {
  const search = document.getElementById('designerSearch').value.toLowerCase();
  const select = document.getElementById('designerFilter');
  const options = select.querySelectorAll('option:not(:first-child)');

  options.forEach(opt => {
    const name = opt.textContent.toLowerCase();
    opt.style.display = name.includes(search) ? '' : 'none';
  });
}

// ===== BÚSQUEDA CON DEBOUNCE =====
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', function () {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      applyFilters();
    }, 300);
  });

  // Escape para cerrar modales
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      closeFavoritesModal();
      closeCategoryEditor();
      closeIconPicker();
    }
  });

  // Click fuera del modal para cerrar
  document.getElementById('previewModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });

  document.getElementById('favoritesModal').addEventListener('click', function (e) {
    if (e.target === this) closeFavoritesModal();
  });

  document.getElementById('categoryEditorModal').addEventListener('click', function (e) {
    if (e.target === this) closeCategoryEditor();
  });

  document.getElementById('iconPickerModal').addEventListener('click', function (e) {
    if (e.target === this) closeIconPicker();
  });

  // Scroll para botón volver arriba
  window.addEventListener('scroll', function () {
    const btn = document.getElementById('backToTop');
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

// ===== RENDERIZAR PATRONES =====
function renderPatterns() {
  const grid = document.getElementById('patternsGrid');
  const emptyState = document.getElementById('emptyState');

  if (state.filteredPatterns.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  // Aplicar vista
  grid.className = state.currentView === 'list' ? 'grid list-view' : 'grid';

  // Renderizar tarjetas con lazy loading
  const fragment = document.createDocumentFragment();

  state.filteredPatterns.forEach((pattern, index) => {
    const card = createCardElement(pattern, index);
    fragment.appendChild(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);
}

function createCardElement(pattern, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = `${Math.min(index * 0.03, 0.6)}s`;

  const isFavorite = state.favorites.includes(pattern.id);
  const allCats = getAllCategories();
  const categoryEmoji = allCats[pattern.category] || '📄';

  // Nombre formateado para mostrar
  const displayName = formatPatternName(pattern.name);

  // Resaltar búsqueda
  const searchTerm = document.getElementById('searchInput').value.trim();
  const highlightedName = searchTerm ? highlightText(displayName, searchTerm) : displayName;
  const highlightedDesigner = searchTerm ? highlightText(pattern.designer, searchTerm) : pattern.designer;

  // Gradiente de fondo basado en el diseñador
  const gradientIndex = pattern.id % 5;
  const gradients = [
    'linear-gradient(135deg, #E8DED4 0%, #D4C8BC 100%)',
    'linear-gradient(135deg, #E0D6CC 0%, #D0C6BC 100%)',
    'linear-gradient(135deg, #E4DCD3 0%, #D4CCC3 100%)',
    'linear-gradient(135deg, #DCD2C8 0%, #CCC2B8 100%)',
    'linear-gradient(135deg, #DED4CA 0%, #CEC4BA 100%)'
  ];

  // Determinar contenido de la imagen
  const hasImage = pattern.image && pattern.image.trim() !== '';
  const imageContent = hasImage
    ? `<img src="${pattern.image}" alt="${displayName}" class="card-img" loading="lazy" onerror="this.style.display='none'; this.parentElement.querySelector('.placeholder-icon').style.display='flex';">`
    : '';
  const placeholderStyle = hasImage ? 'display:none' : 'display:flex';

  card.innerHTML = `
    <div class="card-image" style="background: ${hasImage ? gradients[gradientIndex] : gradients[gradientIndex]}">
      ${imageContent}
      <span class="placeholder-icon" style="${placeholderStyle}">🧶</span>
      <button class="card-fav ${isFavorite ? 'liked' : ''}"
              onclick="event.stopPropagation(); toggleFavorite(${pattern.id})"
              title="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
        ${isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="card-body">
      <div class="card-title">${highlightedName}</div>
      <div class="card-designer">por ${highlightedDesigner}</div>
      <div class="card-badges">
        <span class="badge badge-type">${categoryEmoji} ${pattern.category}</span>
        ${pattern.date ? `<span class="badge badge-date">📅 ${formatDate(pattern.date)}</span>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn-view" onclick="openPreview(${pattern.id})">⚙ Propiedades</button>
        <button class="btn-secondary" onclick="event.stopPropagation(); downloadPdf(${pattern.id})" title="Descargar PDF">⬇</button>
      </div>
    </div>`;

  return card;
}

function formatPatternName(name) {
  // Limpiar nombre: reemplazar guiones bajos y puntos por espacios
  return name
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function highlightText(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(day)} ${months[parseInt(month)-1]} ${year}`;
}

// ===== VISTA =====
function setView(view) {
  state.currentView = view;

  document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
  document.getElementById('listViewBtn').classList.toggle('active', view === 'list');

  renderPatterns();
}

// ===== FAVORITOS =====
function loadFavorites() {
  try {
    const saved = localStorage.getItem('misPatrones_favorites');
    state.favorites = saved ? JSON.parse(saved) : [];
  } catch {
    state.favorites = [];
  }
}

function saveFavorites() {
  localStorage.setItem('misPatrones_favorites', JSON.stringify(state.favorites));
  if (typeof syncToFirebase === 'function') {
    syncToFirebase();
  }
}

function toggleFavorite(id) {
  const index = state.favorites.indexOf(id);
  if (index === -1) {
    state.favorites.push(id);
  } else {
    state.favorites.splice(index, 1);
  }
  saveFavorites();
  updateFavCount();

  // Actualizar solo el botón de favorito clickeado
  document.querySelectorAll('.card-fav').forEach(btn => {
    if (btn.getAttribute('onclick').includes(`toggleFavorite(${id})`)) {
      const isLiked = state.favorites.includes(id);
      btn.classList.toggle('liked', isLiked);
      btn.innerHTML = isLiked ? '❤️' : '🤍';
      btn.title = isLiked ? 'Quitar de favoritos' : 'Agregar a favoritos';
    }
  });

  if (state.showFavoritesOnly) {
    applyFilters();
  }
}

function updateFavCount() {
  document.getElementById('favCount').textContent = state.favorites.length;
}

function toggleFavoritesView() {
  state.showFavoritesOnly = !state.showFavoritesOnly;
  document.getElementById('btnFavorites').classList.toggle('active', state.showFavoritesOnly);

  if (state.showFavoritesOnly) {
    openFavoritesModal();
  } else {
    closeFavoritesModal();
  }

  applyFilters();
}

function openFavoritesModal() {
  const modal = document.getElementById('favoritesModal');
  const list = document.getElementById('favoritesList');

  const favPatterns = state.patterns.filter(p => state.favorites.includes(p.id));

  if (favPatterns.length === 0) {
    list.innerHTML = `
      <div class="fav-empty">
        <div class="icon">💔</div>
        <p>No tienes patrones favoritos aún</p>
        <p style="font-size:0.8rem; margin-top:0.5rem; opacity:0.7;">Haz clic en el corazón de cualquier tarjeta para agregarlo</p>
      </div>`;
  } else {
    const allCats = getAllCategories();
    list.innerHTML = favPatterns.map(p => {
      const emoji = allCats[p.category] || '📄';
      return `
        <div class="fav-list-item">
          <div class="fav-list-info">
            <div class="fav-list-name">${emoji} ${formatPatternName(p.name)}</div>
            <div class="fav-list-designer">por ${p.designer} · ${p.category}</div>
          </div>
          <button class="fav-list-remove" onclick="toggleFavorite(${p.id}); openFavoritesModal();" title="Quitar de favoritos">✕</button>
        </div>`;
    }).join('');
  }

  modal.classList.add('active');
}

function closeFavoritesModal() {
  document.getElementById('favoritesModal').classList.remove('active');
  if (!state.showFavoritesOnly) {
    document.getElementById('btnFavorites').classList.remove('active');
  }
}

// ===== VISTA PREVIA =====
function openPreview(id) {
  const pattern = state.patterns.find(p => p.id === id);
  if (!pattern) return;

  state.currentPreviewId = id;

  document.getElementById('modalPatternName').textContent = formatPatternName(pattern.name);
  document.getElementById('modalDesigner').textContent = `por ${pattern.designer}`;

  // Cargar propiedades guardadas
  const props = loadPatternProperties(id);
  
  // Imagen
  const modalImage = document.getElementById('modalImage');
  if (pattern.image && pattern.image.trim() !== '') {
    modalImage.src = pattern.image;
    modalImage.alt = formatPatternName(pattern.name);
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }

  // Poblar select de categorías dinámicamente
  const allCats = getAllCategories();
  const categorySelect = document.getElementById('modalCategory');
  const currentCategory = props.category || pattern.category;
  categorySelect.innerHTML = Object.entries(allCats)
    .map(([cat, icon]) => `<option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>${icon} ${cat}</option>`)
    .join('');

  // Etiquetas
  document.getElementById('modalTags').value = props.tags || '';

  // Observaciones
  document.getElementById('modalNotes').value = props.notes || '';

  document.getElementById('previewModal').classList.add('active');
}

function closeModal() {
  document.getElementById('previewModal').classList.remove('active');
  state.currentPreviewId = null;
}

// ===== BORRAR DISEÑO =====
function deletePattern() {
  if (!state.currentPreviewId) return;
  
  const pattern = state.patterns.find(p => p.id === state.currentPreviewId);
  if (!pattern) return;
  
  const confirm1 = confirm(`¿Borrar "${pattern.name}" de ${pattern.designer}?\n\nEsto eliminará el archivo PDF y la imagen de tu PC.`);
  if (!confirm1) return;
  
  const confirm2 = confirm(`¿Estás seguro? Esta acción no se puede deshacer.`);
  if (!confirm2) return;
  
  // Agregar a la lista de borrados pendientes
  let pending = [];
  try {
    pending = JSON.parse(localStorage.getItem('misPatrones_pendingDeletions') || '[]');
  } catch {}
  
  if (!pending.includes(pattern.id)) {
    pending.push(pattern.id);
    localStorage.setItem('misPatrones_pendingDeletions', JSON.stringify(pending));
  }
  
  // Quitar de la vista inmediatamente
  state.patterns = state.patterns.filter(p => p.id !== state.currentPreviewId);
  
  // Quitar de favoritos si está
  state.favorites = state.favorites.filter(id => id !== state.currentPreviewId);
  saveFavorites();
  updateFavCount();
  
  closeModal();
  applyFilters();
  populateFilters();
  
  alert(`"${pattern.name}" marcado para borrado.\n\nHaz clic en "Descargar lista de eliminaciones" en el sidebar, guarda el archivo, y ejecuta publicar.bat.`);
  updateDeleteSection();
}

function updateDeleteSection() {
  const pending = JSON.parse(localStorage.getItem('misPatrones_pendingDeletions') || '[]');
  const section = document.getElementById('deleteSection');
  const count = document.getElementById('pendingDeleteCount');
  if (pending.length > 0) {
    section.style.display = 'block';
    count.textContent = pending.length;
  } else {
    section.style.display = 'none';
  }
}

function exportPendingDeletions() {
  const pending = JSON.parse(localStorage.getItem('misPatrones_pendingDeletions') || '[]');
  if (pending.length === 0) {
    alert('No hay eliminaciones pendientes.');
    return;
  }
  
  const dataStr = JSON.stringify(pending, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pending_deletions.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Archivo descargado.\n\nGuárdalo en la carpeta D:\\Natalia\\web\\ y ejecuta publicar.bat');
}

// ===== PROPIEDADES DE PATRONES =====
function loadPatternProperties(id) {
  // Primero buscar en el estado (propiedades aplicadas)
  const pattern = state.patterns.find(p => p.id === Number(id));
  if (pattern && (pattern.tags || pattern.notes)) {
    return {
      category: pattern.category,
      tags: pattern.tags || '',
      notes: pattern.notes || ''
    };
  }
  
  // Si no, buscar en localStorage
  try {
    const saved = localStorage.getItem('misPatrones_properties');
    const allProps = saved ? JSON.parse(saved) : {};
    return allProps[String(id)] || {};
  } catch {
    return {};
  }
}

function savePatternProperties() {
  if (!state.currentPreviewId) return;
  
  const id = String(state.currentPreviewId);
  const category = document.getElementById('modalCategory').value;
  const tags = document.getElementById('modalTags').value;
  const notes = document.getElementById('modalNotes').value;
  
  // Cargar propiedades existentes
  let allProps = {};
  try {
    const saved = localStorage.getItem('misPatrones_properties');
    allProps = saved ? JSON.parse(saved) : {};
  } catch {
    allProps = {};
  }
  
  // Guardar propiedades de este patrón
  allProps[id] = { category, tags, notes };
  localStorage.setItem('misPatrones_properties', JSON.stringify(allProps));
  
  // Actualizar categoría en el estado
  const pattern = state.patterns.find(p => p.id === state.currentPreviewId);
  if (pattern) {
    pattern.category = category;
    pattern.tags = tags;
    pattern.notes = notes;
    applyFilters();
  }
  
  // Sincronizar con Firebase si está disponible
  if (typeof syncToFirebase === 'function') {
    syncToFirebase();
  }
}

function showSaveConfirmation() {
  const btn = document.querySelector('.btn-save-properties');
  if (!btn) return;
  const original = btn.textContent;
  btn.textContent = '✓ Guardado';
  btn.classList.add('saved');
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('saved');
  }, 1500);
}

function getPatternTags(id) {
  const props = loadPatternProperties(String(id));
  return props.tags || '';
}

// ===== APLICAR PROPIEDADES GUARDADAS =====
function applySavedProperties() {
  try {
    const saved = localStorage.getItem('misPatrones_properties');
    const allProps = saved ? JSON.parse(saved) : {};
    
    state.patterns.forEach(pattern => {
      const props = allProps[String(pattern.id)];
      if (props) {
        // Aplicar categoría guardada
        if (props.category) {
          pattern.category = props.category;
        }
        // Guardar etiquetas y notas en el patrón para búsqueda
        pattern.tags = props.tags || '';
        pattern.notes = props.notes || '';
      }
    });
  } catch {
    // Si hay error, continuar con los datos originales
  }
}

// ===== ENLACES MEGA =====
function getMegaLink(designer) {
  return state.megaLinks[designer] || null;
}

function openMegaLink() {
  if (!state.currentPreviewId) return;
  openMegaForPattern(state.currentPreviewId);
}

function openMegaForPattern(id) {
  const pattern = state.patterns.find(p => p.id === id);
  if (!pattern) return;

  const megaUrl = getMegaLink(pattern.designer);

  if (megaUrl) {
    // Abrir enlace de MEGA en nueva pestaña
    window.open(megaUrl, '_blank');
  } else {
    // Mostrar aviso
    alert(`No se encontró enlace de MEGA para ${pattern.designer}.\n\nPuedes agregar el enlace en mega-links.json usando el nombre del diseñador como clave.`);
  }
}

// ===== DESCARGAR PDF =====
function downloadPdf(id) {
  const pattern = state.patterns.find(p => p.id === id);
  if (!pattern) return;

  // Usar link de Google Drive si existe
  if (pattern.downloadUrl && pattern.downloadUrl.trim() !== '') {
    window.open(pattern.downloadUrl, '_blank');
    return;
  }

  // Fallback: intentar abrir PDF local (solo funciona offline)
  if (pattern.pdf && pattern.pdf.trim() !== '') {
    window.open(pattern.pdf, '_blank');
  } else {
    alert('No se encontró el archivo PDF para este patrón.');
  }
}

// ===== UTILIDADES =====
function updateResultCount() {
  const count = state.filteredPatterns.length;
  const total = state.patterns.length;
  const container = document.querySelector('.sidebar-count');
  
  if (count < total) {
    container.innerHTML = `<span>Mostrando <strong>${count}</strong> de ${total} patrones</span>
      <button class="btn-clear" onclick="clearAllFilters()">Limpiar filtros</button>`;
  } else {
    container.innerHTML = `<span>Mostrando <strong>${count}</strong> patrones</span>
      <button class="btn-clear" onclick="clearAllFilters()">Limpiar filtros</button>`;
  }
}

function updateToolbarTitle() {
  const title = document.getElementById('toolbarTitle');
  const count = document.getElementById('toolbarCount');

  const allCats = getAllCategories();
  let label = 'Todos los patrones';
  if (state.showFavoritesOnly) label = 'Favoritos';
  else if (state.selectedCategory) label = `${allCats[state.selectedCategory] || ''} ${state.selectedCategory}`;

  title.innerHTML = `${label} <span>(${state.filteredPatterns.length})</span>`;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetAll() {
  clearAllFilters();
  scrollToTop();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== EDITOR DE CATEGORÍAS =====
const KNIT_ICONS = [
  // Tejido y costura
  '🧶', '🧵', '🪡', '✂️', '🪝', '🪢',
  // Ropa y accesorios
  '🧣', '🧦', '🧤', '🧥', '👕', '👚', '👗', '👔',
  '🧢', '🎩', '👒', '👜', '👠', '👟', '🥾', '🩴',
  // Flores y naturaleza
  '🌸', '🌺', '🌻', '🌹', '🌷', '🍃', '🌿', '🍀',
  '🌵', '🍄', '🌾', '🍂', '🍁', '🌱', '🌲', '🌳',
  // Animales (amigurumi)
  '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁',
  '🐯', '🐮', '🐷', '🐸', '🐵', '🐔', '🦄', '🐝',
  '🦋', '🐞', '🐛', '🐙', '🐢', '🦜', '🐬', '🐳',
  // Corazones y formas
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '💕', '💖', '💗', '💝', '⭐', '🌟', '✨', '💎',
  // Casa y decoración
  '🏠', '🏡', '🛋️', '🧶', '🪑', '🕯️', '🖼️', '🪴',
  // Comida y bebida
  '☕', '🫖', '🍰', '🧁', '🍩', '🍪', '🍫', '🍬',
  // Otros útiles
  '🎀', '🎈', '🎁', '🏷️', '📌', '📎', '📖', '📝',
  '✏️', '🖊️', '📚', '🗂️', '📂', '🔍', '💡', '🎨'
];

const CATEGORY_ICONS = {};
let editingCategoryIndex = -1;
let selectedIcon = '📄';

function loadCustomCategories() {
  try {
    const saved = localStorage.getItem('misPatrones_customCategories');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(categories) {
  localStorage.setItem('misPatrones_customCategories', JSON.stringify(categories));
  if (typeof syncToFirebase === 'function') {
    syncToFirebase();
  }
}

function getAllCategories() {
  const custom = loadCustomCategories();
  
  // Cargar defaults eliminados
  let deletedDefaults = [];
  try {
    deletedDefaults = JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]');
  } catch {}
  
  const result = {};
  
  // Defaults (excepto eliminados)
  Object.keys(CATEGORY_EMOJIS).forEach(cat => {
    if (!deletedDefaults.includes(cat)) {
      result[cat] = CATEGORY_EMOJIS[cat];
    }
  });
  
  // Custom
  custom.forEach(cat => {
    result[cat.name] = cat.icon;
  });
  
  return result;
}

function openCategoryEditor() {
  editingCategoryIndex = -1;
  selectedIcon = '📄';
  document.getElementById('catEditId').value = '';
  document.getElementById('catNameInput').value = '';
  document.getElementById('catIconPreview').textContent = '📄';
  document.getElementById('catFormTitle').textContent = 'Nueva categoría';
  document.getElementById('catSaveBtn').textContent = 'Agregar';
  
  renderCategoryList();
  document.getElementById('categoryEditorModal').classList.add('active');
}

function closeCategoryEditor() {
  document.getElementById('categoryEditorModal').classList.remove('active');
}

function renderCategoryList() {
  const container = document.getElementById('categoryEditorList');
  const custom = loadCustomCategories();
  
  // Construir lista completa: default + custom
  const defaultCats = Object.keys(CATEGORY_EMOJIS).map(name => ({
    name,
    icon: CATEGORY_EMOJIS[name],
    isDefault: true
  }));
  
  const customCats = custom.map(c => ({
    ...c,
    isDefault: false
  }));
  
  const allCats = [...defaultCats, ...customCats];
  
  const categoryCounts = {};
  state.patterns.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  
  container.innerHTML = allCats.map((cat, index) => `
    <div class="cat-editor-item">
      <span class="cat-icon">${cat.icon}</span>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-count">${categoryCounts[cat.name] || 0}</span>
      <div class="cat-actions">
        <button class="btn-edit" onclick="editCategory(${index})" title="Editar">✏️</button>
        <button class="btn-delete" onclick="deleteCategory(${index})" title="Eliminar">🗑️</button>
      </div>
    </div>
  `).join('');
}

function getAllEditableCategories() {
  const custom = loadCustomCategories();
  const defaultCats = Object.keys(CATEGORY_EMOJIS).map(name => ({
    name,
    icon: CATEGORY_EMOJIS[name],
    isDefault: true
  }));
  const customCats = custom.map(c => ({
    ...c,
    isDefault: false
  }));
  return [...defaultCats, ...customCats];
}

function editCategory(index) {
  const allCats = getAllEditableCategories();
  const cat = allCats[index];
  
  editingCategoryIndex = index;
  selectedIcon = cat.icon;
  document.getElementById('catEditId').value = index;
  document.getElementById('catNameInput').value = cat.name;
  document.getElementById('catIconPreview').textContent = cat.icon;
  document.getElementById('catFormTitle').textContent = 'Editar categoría';
  document.getElementById('catSaveBtn').textContent = 'Guardar';
}

function deleteCategory(index) {
  const allCats = getAllEditableCategories();
  const cat = allCats[index];
  
  const patternsUsing = state.patterns.filter(p => p.category === cat.name).length;
  let message = `¿Eliminar la categoría "${cat.name}"?`;
  if (patternsUsing > 0) {
    message += `\n\nHay ${patternsUsing} patrones con esta categoría. Se cambiarán a "Otro".`;
  }
  
  if (confirm(message)) {
    // Cambiar patrones que usan esta categoría a "Otro"
    state.patterns.forEach(p => {
      if (p.category === cat.name) {
        p.category = 'Otro';
      }
    });
    
    // Actualizar propiedades guardadas
    try {
      const saved = localStorage.getItem('misPatrones_properties');
      const allProps = saved ? JSON.parse(saved) : {};
      Object.keys(allProps).forEach(id => {
        if (allProps[id].category === cat.name) {
          allProps[id].category = 'Otro';
        }
      });
      localStorage.setItem('misPatrones_properties', JSON.stringify(allProps));
    } catch {}
    
    // Si es default, agregar a "deletedDefaults" para que no reaparezca
    if (cat.isDefault) {
      let deleted = [];
      try {
        deleted = JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]');
      } catch {}
      if (!deleted.includes(cat.name)) {
        deleted.push(cat.name);
        localStorage.setItem('misPatrones_deletedDefaults', JSON.stringify(deleted));
      }
    } else {
      // Si es custom, eliminar de la lista
      const custom = loadCustomCategories();
      const customIndex = custom.findIndex(c => c.name === cat.name);
      if (customIndex !== -1) {
        custom.splice(customIndex, 1);
        saveCustomCategories(custom);
      }
    }
    
    renderCategoryList();
    populateFilters();
    applyFilters();
  }
}

function saveCategory() {
  const name = document.getElementById('catNameInput').value.trim();
  
  if (!name) {
    alert('Escribe un nombre para la categoría.');
    return;
  }
  
  const allCats = getAllEditableCategories();
  
  // Verificar duplicados (ignorar si es la misma que se está editando)
  const existingIndex = allCats.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
  if (existingIndex !== -1 && existingIndex !== editingCategoryIndex) {
    alert('Ya existe una categoría con ese nombre.');
    return;
  }
  
  const catData = { name, icon: selectedIcon };
  
  if (editingCategoryIndex >= 0) {
    // Editar existente
    const oldCat = allCats[editingCategoryIndex];
    const oldName = oldCat.name;
    
    // Actualizar patrones si cambió el nombre
    if (oldName !== name) {
      state.patterns.forEach(p => {
        if (p.category === oldName) p.category = name;
      });
      // Actualizar propiedades guardadas
      try {
        const saved = localStorage.getItem('misPatrones_properties');
        const allProps = saved ? JSON.parse(saved) : {};
        Object.keys(allProps).forEach(id => {
          if (allProps[id].category === oldName) {
            allProps[id].category = name;
          }
        });
        localStorage.setItem('misPatrones_properties', JSON.stringify(allProps));
      } catch {}
    }
    
    if (oldCat.isDefault) {
      // Si es default, guardar como custom (con posible nuevo nombre/icono)
      let custom = loadCustomCategories();
      const existingCustom = custom.findIndex(c => c.name === oldName);
      if (existingCustom !== -1) {
        custom[existingCustom] = catData;
      } else {
        custom.push(catData);
      }
      saveCustomCategories(custom);
      
      // Si el nombre cambió, marcar el default como eliminado
      if (oldName !== name) {
        let deleted = [];
        try {
          deleted = JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]');
        } catch {}
        if (!deleted.includes(oldName)) {
          deleted.push(oldName);
          localStorage.setItem('misPatrones_deletedDefaults', JSON.stringify(deleted));
        }
      }
    } else {
      // Si es custom, actualizar directamente
      let custom = loadCustomCategories();
      const existingCustom = custom.findIndex(c => c.name === oldName);
      if (existingCustom !== -1) {
        custom[existingCustom] = catData;
      }
      saveCustomCategories(custom);
    }
  } else {
    // Agregar nueva
    let custom = loadCustomCategories();
    custom.push(catData);
    saveCustomCategories(custom);
  }
  
  cancelCategoryEdit();
  populateFilters();
  applyFilters();
}

function cancelCategoryEdit() {
  editingCategoryIndex = -1;
  selectedIcon = '📄';
  document.getElementById('catEditId').value = '';
  document.getElementById('catNameInput').value = '';
  document.getElementById('catIconPreview').textContent = '📄';
  document.getElementById('catFormTitle').textContent = 'Nueva categoría';
  document.getElementById('catSaveBtn').textContent = 'Agregar';
}

// ===== SELECTOR DE ICONOS =====
function openIconPicker() {
  const grid = document.getElementById('iconPickerGrid');
  grid.innerHTML = KNIT_ICONS.map(icon => `
    <button type="button" class="icon-picker-item ${icon === selectedIcon ? 'selected' : ''}" 
            onclick="selectIcon('${icon}')">${icon}</button>
  `).join('');
  
  document.getElementById('iconPickerModal').classList.add('active');
}

function closeIconPicker() {
  document.getElementById('iconPickerModal').classList.remove('active');
}

function selectIcon(icon) {
  selectedIcon = icon;
  document.getElementById('catIconPreview').textContent = icon;
  closeIconPicker();
}

// ===== EXPORTAR/IMPORTAR DATOS =====
function exportAllData() {
  const data = {
    properties: JSON.parse(localStorage.getItem('misPatrones_properties') || '{}'),
    favorites: JSON.parse(localStorage.getItem('misPatrones_favorites') || '[]'),
    customCategories: JSON.parse(localStorage.getItem('misPatrones_customCategories') || '[]'),
    deletedDefaults: JSON.parse(localStorage.getItem('misPatrones_deletedDefaults') || '[]'),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mis_patrones_datos.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Datos exportados.\n\nGuárdalo en un lugar seguro. Puedes importarlo en otro dispositivo.');
}

function importAllData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (!data.properties && !data.favorites) {
        alert('El archivo no parece ser un archivo de datos válido.');
        return;
      }
      
      const confirm1 = confirm(`Importar datos del ${data.exportDate ? new Date(data.exportDate).toLocaleString() : 'fecha desconocida'}?\n\nEsto REEMPLAZARÁ tus datos actuales.`);
      if (!confirm1) return;
      
      if (data.properties) {
        localStorage.setItem('misPatrones_properties', JSON.stringify(data.properties));
      }
      if (data.favorites) {
        localStorage.setItem('misPatrones_favorites', JSON.stringify(data.favorites));
      }
      if (data.customCategories) {
        localStorage.setItem('misPatrones_customCategories', JSON.stringify(data.customCategories));
      }
      if (data.deletedDefaults) {
        localStorage.setItem('misPatrones_deletedDefaults', JSON.stringify(data.deletedDefaults));
      }
      
      alert('Datos importados correctamente.\n\nRecarga la página para ver los cambios.');
      location.reload();
    } catch (err) {
      alert('Error al leer el archivo: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}