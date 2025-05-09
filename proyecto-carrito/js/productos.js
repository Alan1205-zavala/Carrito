// Lógica para la administración de productos

// Variables globales
let filteredProducts = [];
let currentProductId = null;
let isEditing = false;
let nextProductId = 0;

// Categorías de productos
const categories = {
    smartphones: ['Smartphones', 'Teléfonos'],
    laptops: ['Laptops', 'Computadoras'],
    audio: ['Audio', 'Audífonos', 'Bocinas'],
    accessories: ['Accesorios', 'Periféricos']
};

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario tiene permisos de administrador
    if (userManager && userManager.isAuthenticated()) {
        const currentUser = userManager.currentUser;
        
        // Solo permitir acceso a administradores y proveedores
        if (currentUser.role !== 'admin' && currentUser.role !== 'provider') {
            // Redirigir a la página principal
            window.location.href = 'index.html';
            return;
        }
        
        // Actualizar la interfaz con el usuario autenticado
        updateAuthUI(true, currentUser.name);
    } else {
        // Si no está autenticado, redirigir a login
        window.location.href = 'login.html';
        return;
    }
    
    // Calcular el siguiente ID disponible
    calculateNextProductId();
    
    // Cargar productos
    loadProducts();
    
    // Configurar event listeners
    setupEventListeners();
});

// Actualizar UI según estado de autenticación
function updateAuthUI(isAuthenticated, userName = '') {
    const userActions = document.getElementById('user-actions');
    const authButtons = document.getElementById('auth-buttons');
    const userNameEl = document.getElementById('user-name');
    
    if (isAuthenticated) {
        // Mostrar menú de usuario
        if (userActions) userActions.classList.remove('hidden');
        if (authButtons) authButtons.classList.add('hidden');
        if (userNameEl) userNameEl.textContent = userName;
        
        // Agregar event listener para logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        // Mostrar botones de autenticación
        if (userActions) userActions.classList.add('hidden');
        if (authButtons) authButtons.classList.remove('hidden');
    }
}

// Manejar logout
function handleLogout() {
    userManager.logout();
    window.location.href = 'index.html';
}

// Calcular el siguiente ID disponible para productos
function calculateNextProductId() {
    if (products && products.length > 0) {
        // Encontrar el ID máximo actual
        nextProductId = Math.max(...products.map(product => product.id)) + 1;
    } else {
        nextProductId = 1;
    }
}

// Cargar y mostrar productos
function loadProducts() {
    const productsTableBody = document.getElementById('products-table-body');
    const noProductsMessage = document.getElementById('no-products-message');
    
    // Si no hay productos, mostrar mensaje
    if (!products || products.length === 0) {
        if (productsTableBody) productsTableBody.innerHTML = '';
        if (noProductsMessage) noProductsMessage.style.display = 'block';
        return;
    }
    
    // Ocultar mensaje de no hay productos
    if (noProductsMessage) noProductsMessage.style.display = 'none';
    
    // Filtrar productos según los filtros activos
    filterProducts();
    
    // Limpiar tabla
    if (productsTableBody) productsTableBody.innerHTML = '';
    
    // Mostrar productos filtrados
    filteredProducts.forEach(product => {
        const row = createProductRow(product);
        productsTableBody.appendChild(row);
    });
}

// Crear fila de tabla para un producto
function createProductRow(product) {
    const row = document.createElement('tr');
    
    // Determinar estado del stock
    let stockStatus, stockClass;
    
    if (product.stock <= 0) {
        stockStatus = 'Agotado';
        stockClass = 'out-of-stock';
    } else if (product.stock <= 5) {
        stockStatus = 'Poco stock';
        stockClass = 'low-stock';
    } else {
        stockStatus = 'En stock';
        stockClass = 'in-stock';
    }
    
    // Determinar categoría
    let categoryName = 'Otra';
    for (const [category, keywords] of Object.entries(categories)) {
        if (product.id in categories) {
            categoryName = getCategoryName(category);
            break;
        }
    }
    
    // Contenido de la fila
    row.innerHTML = `
        <td>${product.id}</td>
        <td class="cell-image">
            <img src="${product.image}" alt="${product.name}">
        </td>
        <td>${product.name}</td>
        <td class="cell-price">${product.price.toFixed(2)}</td>
        <td class="cell-discount">${product.discount ? product.discount + '%' : '-'}</td>
        <td class="cell-stock">
            <span class="stock-indicator ${stockClass}">${product.stock}</span>
        </td>
        <td>${getCategoryForProduct(product)}</td>
        <td class="cell-actions">
            <button class="action-btn btn-edit" data-id="${product.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn btn-delete" data-id="${product.id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    
    // Agregar event listeners a los botones
    const editBtn = row.querySelector('.btn-edit');
    const deleteBtn = row.querySelector('.btn-delete');
    
    editBtn.addEventListener('click', () => {
        editProduct(product.id);
    });
    
    deleteBtn.addEventListener('click', () => {
        openDeleteConfirmation(product.id);
    });
    
    return row;
}

// Obtener nombre de categoría para un producto
function getCategoryForProduct(product) {
    // Para este ejemplo, usamos un enfoque simple basado en el ID
    // En un sistema real, se almacenaría la categoría en el objeto del producto
    if (categories.smartphones.includes(product.id)) return 'Smartphones';
    if (categories.laptops.includes(product.id)) return 'Laptops';
    if (categories.audio.includes(product.id)) return 'Audio';
    if (categories.accessories.includes(product.id)) return 'Accesorios';
    
    // Por defecto, usamos un enfoque basado en palabras clave en el nombre o descripción
    const productText = `${product.name} ${product.description}`.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
            if (productText.includes(keyword.toLowerCase())) {
                return getCategoryName(category);
            }
        }
    }
    
    return 'Otra';
}

// Obtener nombre legible de categoría
function getCategoryName(categoryKey) {
    switch(categoryKey) {
        case 'smartphones': return 'Smartphones';
        case 'laptops': return 'Laptops';
        case 'audio': return 'Audio';
        case 'accessories': return 'Accesorios';
        default: return 'Otra';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Event listener para el botón de agregar producto
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openProductModal();
        });
    }
    
    // Event listener para el botón de agregar primer producto
    const addFirstProductBtn = document.getElementById('add-first-product-btn');
    if (addFirstProductBtn) {
        addFirstProductBtn.addEventListener('click', () => {
            openProductModal();
        });
    }
    
    // Event listeners para el modal de producto
    const closeProductModalBtn = document.getElementById('close-product-modal');
    const cancelProductBtn = document.getElementById('cancel-product-btn');
    const productForm = document.getElementById('product-form');
    
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }
    
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductModal);
    }
    
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Event listeners para el modal de confirmación de eliminación
    const closeConfirmModalBtn = document.getElementById('close-confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    if (closeConfirmModalBtn) {
        closeConfirmModalBtn.addEventListener('click', closeDeleteConfirmation);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteConfirmation);
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteProduct);
    }
    
    // Event listeners para filtros
    const searchInput = document.getElementById('search-product');
    const categoryFilter = document.getElementById('category-filter');
    const stockFilter = document.getElementById('stock-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            filterProducts();
        });
    }
    
    if (stockFilter) {
        stockFilter.addEventListener('change', () => {
            filterProducts();
        });
    }
}

// Filtrar productos
function filterProducts() {
    const searchValue = document.getElementById('search-product')?.value.toLowerCase() || '';
    const categoryValue = document.getElementById('category-filter')?.value || 'all';
    const stockValue = document.getElementById('stock-filter')?.value || 'all';
    
    // Filtrar productos basado en los criterios
    filteredProducts = products.filter(product => {
        // Filtro de búsqueda
        const matchesSearch = 
            product.name.toLowerCase().includes(searchValue) || 
            product.description.toLowerCase().includes(searchValue);
        
        // Filtro de categoría
        let matchesCategory = true;
        if (categoryValue !== 'all') {
            matchesCategory = getCategoryForProduct(product).toLowerCase() === getCategoryName(categoryValue).toLowerCase();
        }
        
        // Filtro de stock
        let matchesStock = true;
        if (stockValue === 'in-stock') {
            matchesStock = product.stock > 5;
        } else if (stockValue === 'low-stock') {
            matchesStock = product.stock > 0 && product.stock <= 5;
        } else if (stockValue === 'out-of-stock') {
            matchesStock = product.stock <= 0;
        }
        
        return matchesSearch && matchesCategory && matchesStock;
    });
    
    // Mostrar productos filtrados
    const productsTableBody = document.getElementById('products-table-body');
    const noProductsMessage = document.getElementById('no-products-message');
    
    if (filteredProducts.length === 0) {
        if (productsTableBody) productsTableBody.innerHTML = '';
        if (noProductsMessage) noProductsMessage.style.display = 'block';
    } else {
        if (noProductsMessage) noProductsMessage.style.display = 'none';
        
        // Limpiar tabla
        if (productsTableBody) {
            productsTableBody.innerHTML = '';
            
            // Mostrar productos filtrados
            filteredProducts.forEach(product => {
                const row = createProductRow(product);
                productsTableBody.appendChild(row);
            });
        }
    }
}

// Abrir modal para agregar/editar producto
function openProductModal(productId = null) {
    const productModal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    
    // Resetear formulario
    document.getElementById('product-form').reset();
    
    if (productId) {
        // Modo edición
        isEditing = true;
        currentProductId = productId;
        
        // Cambiar título
        if (modalTitle) modalTitle.textContent = 'Editar Producto';
        
        // Cargar datos del producto
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-rating').value = product.rating;
            document.getElementById('product-reviews').value = product.reviewCount;
            
            // Campos opcionales
            if (product.originalPrice) {
                document.getElementById('product-original-price').value = product.originalPrice;
            }
            
            if (product.discount) {
                document.getElementById('product-discount').value = product.discount;
            }
            
            // Asignar categoría basada en el producto
            const category = getCategoryForProduct(product).toLowerCase();
            for (const [key, value] of Object.entries(categories)) {
                if (getCategoryName(key).toLowerCase() === category) {
                    document.getElementById('product-category').value = key;
                    break;
                }
            }
        }
    } else {
        // Modo creación
        isEditing = false;
        currentProductId = null;
        
        // Cambiar título
        if (modalTitle) modalTitle.textContent = 'Agregar Producto';
    }
    
    // Mostrar modal
    if (productModal) {
        productModal.classList.add('show');
    }
}

// Cerrar modal de producto
function closeProductModal() {
    const productModal = document.getElementById('product-modal');
    
    if (productModal) {
        productModal.classList.remove('show');
    }
    
    // Resetear estado
    isEditing = false;
    currentProductId = null;
}

// Manejar envío del formulario de producto
function handleProductSubmit(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        image: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value,
        rating: parseFloat(document.getElementById('product-rating').value),
        reviewCount: parseInt(document.getElementById('product-reviews').value),
        category: document.getElementById('product-category').value
    };
    
    // Campos opcionales
    const originalPrice = document.getElementById('product-original-price').value;
    if (originalPrice) {
        productData.originalPrice = parseFloat(originalPrice);
    }
    
    const discount = document.getElementById('product-discount').value;
    if (discount) {
        productData.discount = parseInt(discount);
    }
    
    if (isEditing) {
        // Modo edición
        updateProduct(currentProductId, productData);
    } else {
        // Modo creación
        addProduct(productData);
    }
    
    // Cerrar modal
    closeProductModal();
}

// Agregar nuevo producto
function addProduct(productData) {
    // Crear nuevo producto
    const newProduct = {
        id: nextProductId++,
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        image: productData.image,
        description: productData.description,
        rating: productData.rating,
        reviewCount: productData.reviewCount
    };
    
    // Campos opcionales
    if (productData.originalPrice) {
        newProduct.originalPrice = productData.originalPrice;
    }
    
    if (productData.discount) {
        newProduct.discount = productData.discount;
    }
    
    // Agregar a la lista de productos
    products.push(newProduct);
    
    // Guardar en localStorage (simulación de base de datos)
    saveProducts();
    
    // Recargar productos
    loadProducts();
    
    // Mostrar notificación
    showNotification(`Producto "${newProduct.name}" agregado correctamente`, 'success');
}

// Actualizar producto existente
function updateProduct(productId, productData) {
    // Buscar índice del producto
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    
    // Actualizar producto
    products[productIndex] = {
        ...products[productIndex],
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        image: productData.image,
        description: productData.description,
        rating: productData.rating,
        reviewCount: productData.reviewCount
    };
    
    // Campos opcionales
    if (productData.originalPrice) {
        products[productIndex].originalPrice = productData.originalPrice;
    } else {
        delete products[productIndex].originalPrice;
    }
    
    if (productData.discount) {
        products[productIndex].discount = productData.discount;
    } else {
        delete products[productIndex].discount;
    }
    
    // Guardar en localStorage
    saveProducts();
    
    // Recargar productos
    loadProducts();
    
    // Mostrar notificación
    showNotification(`Producto "${productData.name}" actualizado correctamente`, 'success');
}

// Abrir confirmación de eliminación
function openDeleteConfirmation(productId) {
    const confirmModal = document.getElementById('confirm-delete-modal');
    const productNameEl = document.getElementById('delete-product-name');
    
    // Buscar producto
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    
    // Mostrar nombre del producto
    if (productNameEl) {
        productNameEl.textContent = product.name;
    }
    
    // Guardar ID del producto
    currentProductId = productId;
    
    // Mostrar modal
    if (confirmModal) {
        confirmModal.classList.add('show');
    }
}

// Cerrar confirmación de eliminación
function closeDeleteConfirmation() {
    const confirmModal = document.getElementById('confirm-delete-modal');
    
    if (confirmModal) {
        confirmModal.classList.remove('show');
    }
    
    // Resetear estado
    currentProductId = null;
}

// Eliminar producto
function deleteProduct() {
    // Verificar que hay un producto seleccionado
    if (currentProductId === null) {
        showNotification('No hay producto seleccionado', 'error');
        return;
    }
    
    // Buscar producto
    const product = products.find(p => p.id === currentProductId);
    
    if (!product) {
        showNotification('Producto no encontrado', 'error');
        closeDeleteConfirmation();
        return;
    }
    
    // Guardar nombre para el mensaje
    const productName = product.name;
    
    // Eliminar producto
    products = products.filter(p => p.id !== currentProductId);
    
    // Guardar en localStorage
    saveProducts();
    
    // Recargar productos
    loadProducts();
    
    // Cerrar modal
    closeDeleteConfirmation();
    
    // Mostrar notificación
    showNotification(`Producto "${productName}" eliminado correctamente`, 'success');
}

// Guardar productos en localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
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