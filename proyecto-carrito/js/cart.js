// Inicializar variables globales
let cart = [];

// DOM Elements
let cartBtn, closeCartBtn, clearCartBtn, cartOverlay, cartItems, cartSubtotal, cartTax, cartTotal, cartCount;
const taxRate = 0.16; // 16% de IVA

// Variables para almacenar referencias a elementos DOM
let cartCheckoutBtn, simulatePaymentBtn;

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cartBtn = document.getElementById('cart-btn');
    closeCartBtn = document.getElementById('close-cart');
    clearCartBtn = document.getElementById('clear-cart');
    cartOverlay = document.getElementById('cart-overlay');
    cartItems = document.getElementById('cart-items');
    cartSubtotal = document.getElementById('cart-subtotal');
    cartTax = document.getElementById('cart-tax');
    cartTotal = document.getElementById('cart-total');
    cartCount = document.querySelector('.cart-count');

    // Cargar carrito desde localStorage
    loadCart();
    
    // Event listeners
    cartBtn?.addEventListener('click', showCart);
    closeCartBtn?.addEventListener('click', hideCart);
    clearCartBtn?.addEventListener('click', clearCart);
    
    // Cerrar carrito al hacer clic fuera
    cartOverlay?.addEventListener('click', function(e) {
        if (e.target === cartOverlay) {
            hideCart();
        }
    });
    
    // Configurar botones de carrito
    setupCartButtons();
    
    // Verificar si hay usuario autenticado
    checkAuthStatus();
    
    // Debug info para ayudar con la depuración
    console.log('Carrito inicializado', { 
        'DOM Elements': {
            cartBtn,
            closeCartBtn,
            clearCartBtn,
            cartOverlay,
            cartItems,
            cartCount
        },
        'Estado inicial del carrito': cart,
        'Productos disponibles': products
    });
});

// Configurar botones del carrito
function setupCartButtons() {
    const cartButtons = document.querySelector('.cart-buttons');
    if (!cartButtons) return;

    // Limpiar botones existentes para evitar duplicados
    cartButtons.innerHTML = '';
    
    // Agregar botón para vaciar carrito
    const clearCartBtn = document.createElement('button');
    clearCartBtn.id = 'clear-cart';
    clearCartBtn.className = 'btn btn-clear';
    clearCartBtn.textContent = 'Vaciar carrito';
    clearCartBtn.addEventListener('click', clearCart);
    cartButtons.appendChild(clearCartBtn);
    
    // Agregar botón para finalizar compra
    cartCheckoutBtn = document.createElement('button');
    cartCheckoutBtn.id = 'checkout-btn';
    cartCheckoutBtn.className = 'btn';
    cartCheckoutBtn.textContent = 'Finalizar Compra';
    cartCheckoutBtn.addEventListener('click', proceedToCheckout);
    cartButtons.appendChild(cartCheckoutBtn);
    
    // Agregar botón de simulación de pago (solo si estamos en la página principal)
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        simulatePaymentBtn = document.createElement('button');
        simulatePaymentBtn.id = 'simulate-payment-btn';
        simulatePaymentBtn.className = 'btn';
        simulatePaymentBtn.style.backgroundColor = '#ff9f43';
        simulatePaymentBtn.style.marginTop = '10px';
        simulatePaymentBtn.style.width = '100%';
        simulatePaymentBtn.textContent = 'Simular pago exitoso';
        simulatePaymentBtn.addEventListener('click', simulateSuccessfulPayment);
        cartButtons.appendChild(simulatePaymentBtn);
    }
}

// Función para actualizar el stock después de una compra
function updateProductStock(purchasedItems) {
    console.log("Actualizando stock para items:", purchasedItems);
    
    // Recorrer todos los items comprados
    purchasedItems.forEach(item => {
        // Buscar el producto en el inventario
        const productIndex = products.findIndex(product => product.id === item.id);
        
        if (productIndex !== -1) {
            console.log(`Producto ${products[productIndex].name}: stock actual = ${products[productIndex].stock}, cantidad comprada = ${item.quantity}`);
            
            // Reducir el stock según la cantidad comprada
            products[productIndex].stock -= item.quantity;
            
            // Asegurar que el stock no sea negativo
            if (products[productIndex].stock < 0) {
                products[productIndex].stock = 0;
            }
            
            console.log(`Nuevo stock: ${products[productIndex].stock}`);
        }
    });
    
    // Guardar los productos actualizados en localStorage
    localStorage.setItem('products', JSON.stringify(products));
    console.log("Productos actualizados guardados en localStorage");
    
    // Actualizar visualización si estamos en la página de productos
    if (typeof displayProducts === 'function') {
        displayProducts();
    }
}

// Simular un pago exitoso
function simulateSuccessfulPayment() {
    console.log("Simulando pago exitoso");
    
    // Verificar que haya productos en el carrito
    if (cart.length === 0) {
        showToast('El carrito está vacío', 'warning');
        return;
    }
    
    // Crear un objeto similar a lo que devolvería PayPal
    const mockOrderData = {
        id: 'SIMULATED-' + Math.floor(Math.random() * 1000000).toString(),
        status: 'COMPLETED',
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString(),
        payer: {
            name: {
                given_name: 'Cliente',
                surname: 'Simulado'
            },
            email_address: 'cliente.simulado@example.com',
            payer_id: 'SIMULATEDPAYER'
        },
        purchase_units: [
            {
                description: 'Compra en TechShop (SIMULACIÓN)',
                reference_id: 'default',
                soft_descriptor: 'TECHSHOP',
                amount: {
                    currency_code: 'MXN',
                    value: '0.00', // Se actualizará
                    breakdown: {
                        item_total: {
                            currency_code: 'MXN',
                            value: '0.00' // Se actualizará
                        },
                        tax_total: {
                            currency_code: 'MXN',
                            value: '0.00' // Se actualizará
                        }
                    }
                },
                payee: {
                    merchant_id: 'SIMULATEDMERCHANT',
                    email_address: 'comercio@example.com'
                },
                payments: {
                    captures: [
                        {
                            id: 'SIMCAPTURE-' + Math.floor(Math.random() * 1000000).toString(),
                            status: 'COMPLETED',
                            amount: {
                                currency_code: 'MXN',
                                value: '0.00' // Se actualizará
                            },
                            final_capture: true,
                            create_time: new Date().toISOString(),
                            update_time: new Date().toISOString()
                        }
                    ]
                }
            }
        ]
    };
    
    // Calcular los totales del carrito
    const subtotal = cart.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Actualizar los valores en el objeto simulado
    mockOrderData.purchase_units[0].amount.value = total.toFixed(2);
    mockOrderData.purchase_units[0].amount.breakdown.item_total.value = subtotal.toFixed(2);
    mockOrderData.purchase_units[0].amount.breakdown.tax_total.value = tax.toFixed(2);
    mockOrderData.purchase_units[0].payments.captures[0].amount.value = total.toFixed(2);
    
    // Actualizar el stock de los productos
    updateProductStock(cart);
    
    // Mostrar mensaje de éxito
    showToast(`Pago simulado completado correctamente con ID: ${mockOrderData.id}`, 'success');
    
    // Generar recibo
    generateReceipt(mockOrderData);
    
    // Vaciar carrito
    clearCart();
    
    // Ocultar carrito
    hideCart();
    
    // Mostrar modal de recibo
    showReceiptModal();
}

// Verificar estado de autenticación
function checkAuthStatus() {
    try {
        // Verificar si existe la clase UserManager y si hay un usuario autenticado
        if (window.userManager && userManager.isAuthenticated()) {
            const currentUser = userManager.currentUser;
            
            // Actualizar UI
            updateAuthUI(true, currentUser.name);
            
            // Agregar event listener para logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error al verificar estado de autenticación:', error);
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
    try {
        if (window.userManager) {
            userManager.logout();
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Proceder al checkout
function proceedToCheckout() {
    // Verificar que haya productos en el carrito
    if (cart.length === 0) {
        showToast('El carrito está vacío', 'warning');
        return;
    }
    
    // Redirigir a la página de checkout
    window.location.href = 'checkout.html';
}

// Funciones del carrito
function showCart() {
    cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

function hideCart() {
    cartOverlay.classList.remove('show');
    document.body.style.overflow = ''; // Restaurar scroll
}

function addToCart(productId) {
    // Buscar el producto
    const product = findProductById(productId);
    
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    // Verificar si hay stock disponible
    if (product.stock <= 0) {
        showToast('Este producto está agotado', 'warning');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Incrementar cantidad si ya existe
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showToast(`Se agregó otro ${product.name} al carrito`);
        } else {
            showToast('Has alcanzado el límite de stock disponible', 'warning');
            return;
        }
    } else {
        // Agregar nuevo item al carrito
        // Asegurarnos que el precio tenga formato correcto para evitar problemas con PayPal
        const priceFormatted = parseFloat(product.price).toFixed(2);
        
        cart.push({
            id: productId,
            name: product.name,
            price: priceFormatted, // Guardar con 2 decimales exactos como string
            image: product.image,
            quantity: 1
        });
        showToast(`${product.name} agregado al carrito`);
    }
    
    // Actualizar carrito y guardar en localStorage
    updateCart();
    saveCart();
    
    // Mostrar el carrito
    showCart();
    
    // Animación del botón del carrito
    cartBtn.classList.add('pulse');
    setTimeout(() => {
        cartBtn.classList.remove('pulse');
    }, 300);
    
    // Actualizar la visualización de los productos (para mostrar stock actualizado)
    if (typeof displayProducts === 'function') {
        displayProducts();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCart();
    
    // Mostrar mensaje
    const product = findProductById(productId);
    if (product) {
        showToast(`${product.name} eliminado del carrito`);
    }
}

function updateItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    const product = findProductById(productId);
    
    if (!item || !product) return;
    
    // Verificar stock disponible
    if (quantity > product.stock) {
        showToast('No hay suficiente stock disponible', 'warning');
        return;
    }
    
    if (quantity < 1) {
        // Eliminar item si la cantidad es menor a 1
        removeFromCart(productId);
    } else {
        // Actualizar cantidad
        item.quantity = quantity;
        updateCart();
        saveCart();
    }
    
    // Actualizar la visualización de los productos
    if (typeof displayProducts === 'function') {
        displayProducts();
    }
}

function clearCart() {
    cart = [];
    updateCart();
    saveCart();
    showToast('Carrito vaciado');
}

function updateCart() {
    // Actualizar contador del carrito
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    // Actualizar items en el carrito
    renderCartItems();
    
    // Calcular totales
    calculateTotals();
}

function renderCartItems() {
    // Verificar si el carrito está disponible
    if (!cartItems) return;
    
    // Limpiar contenedor de items
    cartItems.innerHTML = '';
    
    // Verificar si el carrito está vacío
    if (cart.length === 0) {
        // Mostrar mensaje de carrito vacío
        cartItems.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <p>¡Añade algunos productos para continuar!</p>
            </div>
        `;
        return;
    }
    
    // Agregar cada item al carrito
    cart.forEach(item => {
        // Verificar si el producto aún existe
        const product = findProductById(item.id);
        if (!product) {
            console.warn(`Producto con ID ${item.id} no encontrado, posiblemente fue eliminado.`);
            return; // Saltar este producto
        }
        
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" min="1" max="${product.stock}" value="${item.quantity}" class="quantity-input" data-id="${item.id}">
                        <button class="quantity-btn increase" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="stock-info" style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                    Stock disponible: ${product.stock - item.quantity} unidad${(product.stock - item.quantity) !== 1 ? 'es' : ''}
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateItemQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateItemQuantity(productId, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const quantity = parseInt(this.value);
            updateItemQuantity(productId, quantity);
        });
    });
}

function calculateTotals() {
    // Calcular subtotal con precisión
    const subtotal = cart.reduce((total, item) => {
        // Convertir a números y calcular con precisión
        const itemPrice = parseFloat(item.price);
        const itemQuantity = parseInt(item.quantity);
        const itemTotal = itemPrice * itemQuantity;
        return total + itemTotal;
    }, 0);
    
    // Calcular IVA
    const tax = subtotal * taxRate;
    
    // Total
    const total = subtotal + tax;
    
    // Actualizar DOM con 2 decimales siempre
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Para debugging
    console.log('Cálculo de totales:');
    console.log('Items en el carrito:', cart);
    console.log('Subtotal calculado:', subtotal.toFixed(2));
}

// Funciones de localStorage
function saveCart() {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
        try {
            const parsedCart = JSON.parse(savedCart);
            
            // Verificar que cada producto en el carrito aún existe
            cart = parsedCart.filter(item => {
                const product = findProductById(item.id);
                if (!product) {
                    console.warn(`Producto con ID ${item.id} no encontrado, se eliminará del carrito.`);
                    return false;
                }
                
                // Verificar que la cantidad no supera el stock actual
                if (item.quantity > product.stock) {
                    console.warn(`Cantidad de ${item.name} ajustada de ${item.quantity} a ${product.stock} debido al stock disponible.`);
                    item.quantity = product.stock > 0 ? product.stock : 0;
                }
                
                // Solo incluir productos con cantidad > 0
                return item.quantity > 0;
            });
            
            updateCart();
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            cart = [];
            localStorage.removeItem('shopping-cart');
        }
    }
}

// Función para encontrar un producto por ID
function findProductById(id) {
    return products.find(product => product.id === id);
}

// Función para mostrar notificaciones
function showToast(message, type = 'success') {
    // Verificar si ya existe un toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Crear nuevo toast
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Estilos para el toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        background-color: white;
        color: #333;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-content {
        display: flex;
        align-items: center;
    }
    
    .toast-content i {
        margin-right: 10px;
    }
    
    .toast-success i {
        color: #3ae374;
    }
    
    .toast-warning i {
        color: #ff9f43;
    }
    
    .toast-error i {
        color: #ff6b6b;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .pulse {
        animation: pulse 0.3s;
    }
`;

document.head.appendChild(toastStyles);