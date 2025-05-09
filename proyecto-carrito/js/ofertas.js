// Lógica para la página de ofertas

// Categorías de productos
const categories = {
    smartphones: [1, 5], // IDs de productos que son smartphones
    laptops: [2],        // IDs de productos que son laptops
    audio: [3, 7],       // IDs de productos que son audio
    accessories: [6, 8]  // IDs de productos que son accesorios
};

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar estado de autenticación
    if (typeof userManager !== 'undefined') {
        checkAuthStatus();
    }
    
    // Cargar productos en cada categoría
    loadCategoryProducts('smartphones');
    loadCategoryProducts('laptops');
    loadCategoryProducts('audio');
    loadCategoryProducts('accessories');
    
    // Configurar evento para formulario de suscripción
    setupSubscriptionForm();
    
    // Configurar evento para el botón de checkout
    setupCheckoutButton();
});

// Verificar estado de autenticación
function checkAuthStatus() {
    // Verificar si hay un usuario autenticado
    if (userManager.isAuthenticated()) {
        updateAuthUI(true, userManager.currentUser.name);
        
        // Agregar event listener para logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        updateAuthUI(false);
    }
}

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
    } else {
        // Mostrar botones de autenticación
        if (userActions) userActions.classList.add('hidden');
        if (authButtons) authButtons.classList.remove('hidden');
    }
}

// Manejar logout
function handleLogout() {
    userManager.logout();
    window.location.reload();
}

// Cargar productos de una categoría
function loadCategoryProducts(category) {
    const container = document.getElementById(`${category}-container`);
    if (!container) return;
    
    // Filtrar productos por categoría
    const categoryProducts = products.filter(product => 
        categories[category].includes(product.id)
    );
    
    // Ordenar productos (primero los que tienen descuento)
    categoryProducts.sort((a, b) => {
        if (b.discount && !a.discount) return 1;
        if (a.discount && !b.discount) return -1;
        return b.discount - a.discount; // Mayor descuento primero
    });
    
    // Mostrar productos
    categoryProducts.forEach(product => {
        // Crear tarjeta de producto
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    // Si no hay productos en la categoría, mostrar mensaje
    if (categoryProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products-message">
                <p>No hay productos disponibles en esta categoría actualmente.</p>
            </div>
        `;
    }
}

// Crear tarjeta de producto
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    
    // Verificar si hay stock disponible
    const outOfStock = product.stock <= 0;
    const stockClass = outOfStock ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : '';
    
    // Crear estructura de la tarjeta
    productCard.innerHTML = `
        <div class="product-img ${stockClass}">
            ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
            ${outOfStock ? `<div class="stock-badge">Agotado</div>` : product.stock <= 5 ? `<div class="stock-badge low">Quedan ${product.stock}</div>` : ''}
            <img src="${product.image}" alt="${product.name}">
            ${outOfStock ? `<div class="out-of-stock-overlay"><span>Agotado</span></div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
                <span class="current-price">$${product.price.toFixed(2)}</span>
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <div class="rating">
                    <div class="stars">
                        ${getStarsHTML(product.rating)}
                    </div>
                    <span class="rating-count">(${product.reviewCount})</span>
                </div>
                <button class="add-to-cart ${outOfStock ? 'disabled' : ''}" data-id="${product.id}" ${outOfStock ? 'disabled' : ''}>
                    <i class="fas ${outOfStock ? 'fa-times' : 'fa-plus'}"></i>
                </button>
            </div>
            ${!outOfStock ? `<div class="stock-info">Stock disponible: ${product.stock}</div>` : ''}
        </div>
    `;
    
    // Agregar event listener al botón de agregar al carrito
    const addToCartBtn = productCard.querySelector('.add-to-cart');
    if (addToCartBtn && !outOfStock) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product.id);
        });
    }
    
    return productCard;
}

// Generar HTML para estrellas de valoración
function getStarsHTML(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    // Agregar estrellas completas
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Agregar media estrella si aplica
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Agregar estrellas vacías
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Configurar evento para formulario de suscripción
function setupSubscriptionForm() {
    const subscriptionForm = document.getElementById('subscription-form');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', event => {
            event.preventDefault();
            
            const emailInput = subscriptionForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // En un sistema real, aquí enviaríamos el email al servidor
                // Para este demo, solo simulamos el registro
                
                // Limpiar formulario
                emailInput.value = '';
                
                // Mostrar notificación
                showNotification('¡Gracias por suscribirte! Recibirás nuestras ofertas en tu correo.', 'success');
            }
        });
    }
}

// Configurar evento para el botón de checkout
function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
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