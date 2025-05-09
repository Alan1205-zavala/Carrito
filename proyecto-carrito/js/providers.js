// Lógica para el panel de proveedores

// Variables globales
let currentProvider = null;
let lowStockThreshold = 10; // Umbral para productos con poco stock
let outOfStockThreshold = 0; // Umbral para productos agotados
let filteredProducts = [];
let currentFilter = 'all';

// Referencias a elementos DOM
let providerNameEl, productsList, stockStatistics;
let filterAllBtn, filterLowBtn, filterOutBtn;
let productTemplate;
let restockForm, restockProductId, restockQuantity;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un usuario autenticado con rol de proveedor o admin
    if (!userManager.isAuthenticated() || 
        !(userManager.hasRole('provider') || userManager.hasRole('admin'))) {
        // Redirigir a la página principal si no tiene acceso
        window.location.href = 'index.html';
        return;
    }
    
    // Obtener referencias a elementos DOM
    providerNameEl = document.getElementById('provider-name');
    productsList = document.getElementById('products-list');
    stockStatistics = document.getElementById('stock-statistics');
    
    filterAllBtn = document.getElementById('filter-all');
    filterLowBtn = document.getElementById('filter-low');
    filterOutBtn = document.getElementById('filter-out');
    
    restockForm = document.getElementById('restock-form');
    restockProductId = document.getElementById('restock-product-id');
    restockQuantity = document.getElementById('restock-quantity');
    
    // Plantilla para productos
    productTemplate = document.getElementById('product-template');
    
    // Cargar datos del proveedor
    loadProviderData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar productos (mostrar todos inicialmente)
    updateProductsList();
});

// Cargar datos del proveedor
function loadProviderData() {
    currentProvider = userManager.currentUser;
    
    // Actualizar nombre del proveedor
    if (providerNameEl) {
        providerNameEl.textContent = currentProvider.name;
    }
    
    // Actualizar nombre de usuario en el menú
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = currentProvider.name;
    }
    
    // Actualizar estadísticas de stock
    updateStockStatistics();
}

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para filtros
    if (filterAllBtn) {
        filterAllBtn.addEventListener('click', () => filterProducts('all'));
    }
    
    if (filterLowBtn) {
        filterLowBtn.addEventListener('click', () => filterProducts('low'));
    }
    
    if (filterOutBtn) {
        filterOutBtn.addEventListener('click', () => filterProducts('out'));
    }
    
    // Event listener para formulario de reabastecimiento
    if (restockForm) {
        restockForm.addEventListener('submit', handleRestockSubmit);
    }
    
    // Event listener para logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            userManager.logout();
            window.location.href = 'index.html';
        });
    }
}

// Filtrar productos
function filterProducts(filter) {
    // Actualizar filtro actual
    currentFilter = filter;
    
    // Actualizar clases de botones
    filterAllBtn.classList.toggle('active', filter === 'all');
    filterLowBtn.classList.toggle('active', filter === 'low');
    filterOutBtn.classList.toggle('active', filter === 'out');
    
    // Actualizar lista de productos
    updateProductsList();
}

// Actualizar lista de productos
function updateProductsList() {
    // Limpiar lista
    productsList.innerHTML = '';
    
    // Filtrar productos según criterio actual
    filteredProducts = products.filter(product => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'low') return product.stock <= lowStockThreshold && product.stock > outOfStockThreshold;
        if (currentFilter === 'out') return product.stock <= outOfStockThreshold;
        return true;
    });
    
    // Ordenar productos (agotados primero, luego poco stock, por último stock normal)
    filteredProducts.sort((a, b) => {
        // Primero productos agotados
        if (a.stock <= outOfStockThreshold && b.stock > outOfStockThreshold) return -1;
        if (b.stock <= outOfStockThreshold && a.stock > outOfStockThreshold) return 1;
        
        // Luego productos con poco stock
        if (a.stock <= lowStockThreshold && b.stock > lowStockThreshold) return -1;
        if (b.stock <= lowStockThreshold && a.stock > lowStockThreshold) return 1;
        
        // Por último, ordenar por stock ascendente
        return a.stock - b.stock;
    });
    
    // Verificar si hay productos filtrados
    if (filteredProducts.length === 0) {
        productsList.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-box-open"></i>
                <p>No hay productos que coincidan con este filtro</p>
            </div>
        `;
        return;
    }
    
    // Mostrar productos
    filteredProducts.forEach(product => {
        // Crear tarjeta de producto
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Determinar estado del stock
        let stockStatus, stockClass;
        
        if (product.stock <= outOfStockThreshold) {
            stockStatus = 'Agotado';
            stockClass = 'out-of-stock';
        } else if (product.stock <= lowStockThreshold) {
            stockStatus = 'Poco stock';
            stockClass = 'low-stock';
        } else {
            stockStatus = 'En stock';
            stockClass = 'in-stock';
        }
        
        // Configurar HTML de la tarjeta
        productCard.innerHTML = `
            <div class="product-img ${stockClass}">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock ${stockClass}">
                    <span class="stock-label">${stockStatus}</span>
                    <span class="stock-quantity">${product.stock} unidades</span>
                </div>
                <button class="btn restock-btn" data-id="${product.id}" data-name="${product.name}">
                    <i class="fas fa-plus-circle"></i> Reabastecer
                </button>
            </div>
        `;
        
        // Agregar a la lista
        productsList.appendChild(productCard);
    });
    
    // Agregar event listeners a botones de reabastecimiento
    document.querySelectorAll('.restock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.getAttribute('data-id'));
            const productName = btn.getAttribute('data-name');
            showRestockModal(productId, productName);
        });
    });
}

// Actualizar estadísticas de stock
function updateStockStatistics() {
    // Contar productos según su estado de stock
    const totalProducts = products.length;
    const outOfStockProducts = products.filter(p => p.stock <= outOfStockThreshold).length;
    const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold && p.stock > outOfStockThreshold).length;
    const normalStockProducts = totalProducts - outOfStockProducts - lowStockProducts;
    
    // Actualizar estadísticas en el DOM
    stockStatistics.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalProducts}</div>
            <div class="stat-label">Total de productos</div>
        </div>
        <div class="stat-card out-of-stock">
            <div class="stat-value">${outOfStockProducts}</div>
            <div class="stat-label">Productos agotados</div>
        </div>
        <div class="stat-card low-stock">
            <div class="stat-value">${lowStockProducts}</div>
            <div class="stat-label">Productos con poco stock</div>
        </div>
        <div class="stat-card in-stock">
            <div class="stat-value">${normalStockProducts}</div>
            <div class="stat-label">Productos con stock normal</div>
        </div>
    `;
}

// Mostrar modal de reabastecimiento
function showRestockModal(productId, productName) {
    // Completar datos en el formulario de reabastecimiento
    restockProductId.value = productId;
    
    // Actualizar título del modal
    document.getElementById('restock-product-name').textContent = productName;
    
    // Resetear cantidad
    restockQuantity.value = '';
    
    // Mostrar modal
    document.getElementById('restock-modal').classList.add('show');
}

// Ocultar modal de reabastecimiento
function hideRestockModal() {
    document.getElementById('restock-modal').classList.remove('show');
}

// Manejar envío del formulario de reabastecimiento
function handleRestockSubmit(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const productId = parseInt(restockProductId.value);
    const quantity = parseInt(restockQuantity.value);
    
    // Validar cantidad
    if (isNaN(quantity) || quantity <= 0) {
        showNotification('Por favor, ingresa una cantidad válida', 'error');
        return;
    }
    
    // Buscar producto
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        showNotification('Producto no encontrado', 'error');
        hideRestockModal();
        return;
    }
    
    // Actualizar stock
    products[productIndex].stock += quantity;
    
    // Guardar datos (en este caso solo simulamos, en un sistema real se enviaría al servidor)
    localStorage.setItem('products', JSON.stringify(products));
    
    // Actualizar UI
    updateProductsList();
    updateStockStatistics();
    
    // Mostrar notificación
    showNotification(`Se han añadido ${quantity} unidades de ${products[productIndex].name}`, 'success');
    
    // Cerrar modal
    hideRestockModal();
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Verificar si ya existe una notificación
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Añadir estilos
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 25px;
        border-radius: 5px;
        background-color: white;
        color: #333;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        min-width: 280px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Añadir estilos según tipo
    let bgColor, textColor;
    switch (type) {
        case 'success':
            bgColor = '#d4f8e8';
            textColor = '#1b9e5a';
            break;
        case 'error':
            bgColor = '#ffe1e3';
            textColor = '#b81f2c';
            break;
        case 'info':
        default:
            bgColor = '#e8f1fd';
            textColor = '#1665d8';
    }
    
    notification.style.backgroundColor = bgColor;
    notification.style.color = textColor;
    
    // Estilos para el icono
    const style = document.createElement('style');
    style.textContent = `
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-content i {
            margin-right: 10px;
            font-size: 1.1rem;
        }
    `;
    document.head.appendChild(style);
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}