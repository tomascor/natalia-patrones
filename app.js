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
  // Cargar favoritos de localStorage
  loadFavorites();

  // Mostrar skeleton loading
  showSkeletons();

  // Cargar datos
  await Promise.all([loadPatterns(), loadMegaLinks]);

  // Poblar filtros
  populateFilters();

  // Renderizar tarjetas
  applyFilters();

  // Configurar eventos
  setupEventListeners();

  // Actualizar UI
  updateFavCount();
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

  const tagsContainer = document.getElementById('categoryTags');
  let tagsHtml = '<button class="tag active" onclick="selectCategory(\'\')">Todos</button>';
  categories.forEach(cat => {
    const emoji = CATEGORY_EMOJIS[cat] || '📄';
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

  state.filteredPatterns = state.patterns.filter(pattern => {
    // Filtro de búsqueda
    if (searchTerm) {
      const searchable = `${pattern.name} ${pattern.designer} ${pattern.category}`.toLowerCase();
      if (!searchable.includes(searchTerm)) return false;
    }

    // Filtro de diseñador
    if (designerFilter && pattern.designer !== designerFilter) return false;

    // Filtro de categoría
    if (category && pattern.category !== category) return false;

    // Modo favoritos
    if (state.showFavoritesOnly && !state.favorites.includes(pattern.id)) return false;

    return true;
  });

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
    }
  });

  // Click fuera del modal para cerrar
  document.getElementById('previewModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });

  document.getElementById('favoritesModal').addEventListener('click', function (e) {
    if (e.target === this) closeFavoritesModal();
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
  const categoryEmoji = CATEGORY_EMOJIS[pattern.category] || '📄';

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
      <span class="pdf-badge">PDF</span>
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
      </div>
      <div class="card-actions">
        <button class="btn-view" onclick="openPreview(${pattern.id})">👁 Ver patrón</button>
        <button class="btn-secondary" onclick="event.stopPropagation(); openMegaForPattern(${pattern.id})" title="Abrir en MEGA">⬇</button>
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

  // Re-renderizar si estamos en modo favoritos o si la tarjeta es visible
  if (state.showFavoritesOnly) {
    applyFilters();
  } else {
    // Solo actualizar los botones de favorito visibles
    document.querySelectorAll('.card-fav').forEach(btn => {
      const card = btn.closest('.card');
      if (card) {
        // Re-renderizar para mantener consistencia
        renderPatterns();
      }
    });
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
    list.innerHTML = favPatterns.map(p => {
      const emoji = CATEGORY_EMOJIS[p.category] || '📄';
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
  document.getElementById('modalDesigner').textContent = `por ${pattern.designer} · ${pattern.category}`;

  // Mostrar imagen si existe
  const modalImage = document.getElementById('modalImage');
  const modalIcon = document.getElementById('modalIcon');
  
  if (pattern.image && pattern.image.trim() !== '') {
    modalImage.src = pattern.image;
    modalImage.alt = formatPatternName(pattern.name);
    modalImage.style.display = 'block';
    modalIcon.style.display = 'none';
  } else {
    modalImage.style.display = 'none';
    modalIcon.style.display = 'flex';
  }

  document.getElementById('previewModal').classList.add('active');
}

function closeModal() {
  document.getElementById('previewModal').classList.remove('active');
  state.currentPreviewId = null;
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

// ===== UTILIDADES =====
function updateResultCount() {
  document.getElementById('resultCount').textContent = state.filteredPatterns.length;
}

function updateToolbarTitle() {
  const title = document.getElementById('toolbarTitle');
  const count = document.getElementById('toolbarCount');

  let label = 'Todos los patrones';
  if (state.showFavoritesOnly) label = 'Favoritos';
  else if (state.selectedCategory) label = `${CATEGORY_EMOJIS[state.selectedCategory] || ''} ${state.selectedCategory}`;

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