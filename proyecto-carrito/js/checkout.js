// Lógica para la página de checkout

// Variables globales
let cart = [];
const taxRate = 0.16; // 16% de IVA

// Referencias a elementos DOM
let orderSummaryItems, summarySubtotal, summaryTax, summaryTotal;
let cardNumberInput, cardHolderInput, cardExpiryInput, cardCvvInput;
let cardNumberPreview, cardHolderPreview, cardExpiryPreview, cardCvvPreview;
let cardContainer, cardTypeIcon, cardIcon, cvvInfo, cvvTooltip;
let useTestCardBtn, completeOrderBtn;
let paymentProcessingModal, orderConfirmedModal;
let confirmedOrderId, confirmedOrderTotal, confirmedPaymentMethod;
let viewReceiptBtn;

// Direcciones
let savedAddressesContainer, addressesGrid, newAddressBtn, addressFormFields;
let saveAddressOption;
let selectedAddressId = null;

// Referencias a campos de dirección
let firstNameInput, lastNameInput, streetInput, cityInput, stateInput, zipInput, countryInput, phoneInput, emailInput, saveAddressCheckbox;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un carrito
    loadCart();
    
    if (cart.length === 0) {
        // Redirigir a la página principal si no hay productos en el carrito
        window.location.href = 'index.html';
        return;
    }
    
    // Obtener referencias a elementos DOM
    orderSummaryItems = document.getElementById('summary-items');
    summarySubtotal = document.getElementById('summary-subtotal');
    summaryTax = document.getElementById('summary-tax');
    summaryTotal = document.getElementById('summary-total');
    
    // Elementos del formulario de tarjeta
    cardNumberInput = document.getElementById('card-number');
    cardHolderInput = document.getElementById('card-holder');
    cardExpiryInput = document.getElementById('card-expiry');
    cardCvvInput = document.getElementById('card-cvv');
    
    // Elementos de la previsualización de tarjeta
    cardNumberPreview = document.getElementById('card-number-preview');
    cardHolderPreview = document.getElementById('card-holder-preview');
    cardExpiryPreview = document.getElementById('card-expiry-preview');
    cardCvvPreview = document.getElementById('card-cvv-preview');
    
    cardContainer = document.querySelector('.card-container');
    cardTypeIcon = document.getElementById('card-type-icon');
    cardIcon = document.getElementById('card-icon');
    
    // Elementos del tooltip
    cvvInfo = document.getElementById('cvv-info');
    cvvTooltip = document.getElementById('cvv-tooltip');
    
    // Botones
    useTestCardBtn = document.getElementById('use-test-card');
    completeOrderBtn = document.getElementById('complete-order-btn');
    
    // Modales
    paymentProcessingModal = document.getElementById('payment-processing-modal');
    orderConfirmedModal = document.getElementById('order-confirmed-modal');
    
    // Elementos de confirmación
    confirmedOrderId = document.getElementById('confirmed-order-id');
    confirmedOrderTotal = document.getElementById('confirmed-order-total');
    confirmedPaymentMethod = document.getElementById('confirmed-payment-method');
    viewReceiptBtn = document.getElementById('view-receipt-btn');
    
    // Elementos de dirección
    savedAddressesContainer = document.getElementById('saved-addresses');
    addressesGrid = document.getElementById('addresses-grid');
    newAddressBtn = document.getElementById('new-address-btn');
    addressFormFields = document.getElementById('address-form-fields');
    saveAddressOption = document.getElementById('save-address-option');
    
    // Campos de dirección
    firstNameInput = document.getElementById('first-name');
    lastNameInput = document.getElementById('last-name');
    streetInput = document.getElementById('street');
    cityInput = document.getElementById('city');
    stateInput = document.getElementById('state');
    zipInput = document.getElementById('zip');
    countryInput = document.getElementById('country');
    phoneInput = document.getElementById('phone');
    emailInput = document.getElementById('email');
    saveAddressCheckbox = document.getElementById('save-address');
    
    // Verificar si hay un usuario autenticado
    if (userManager.isAuthenticated()) {
        setupForLoggedInUser();
    }
    
    // Cargar resumen del pedido
    loadOrderSummary();
    
    // Configurar event listeners
    setupEventListeners();
});

// Configurar la vista para usuario autenticado
function setupForLoggedInUser() {
    const currentUser = userManager.currentUser;
    
    // Actualizar nombre de usuario
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = currentUser.name;
    }
    
    // Cargar direcciones guardadas si existen
    if (currentUser.addresses && currentUser.addresses.length > 0) {
        savedAddressesContainer.classList.remove('hidden');
        loadSavedAddresses();
    }
    
    // Mostrar opción para guardar dirección
    saveAddressOption.classList.remove('hidden');
    
    // Prellenar campos de correo electrónico
    if (emailInput) {
        emailInput.value = currentUser.email;
    }
}

// Cargar direcciones guardadas
function loadSavedAddresses() {
    const currentUser = userManager.currentUser;
    
    if (!currentUser || !currentUser.addresses || !addressesGrid) return;
    
    // Limpiar contenedor
    addressesGrid.innerHTML = '';
    
    // Añadir direcciones
    currentUser.addresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card';
        addressCard.setAttribute('data-id', address.id);
        
        // Seleccionar la predeterminada por defecto
        if (address.default) {
            addressCard.classList.add('selected');
            selectedAddressId = address.id;
            hideAddressForm();
        }
        
        // Determinar clase para el tipo de dirección
        let addressTypeText;
        switch(address.type) {
            case 'home':
                addressTypeText = 'Casa';
                break;
            case 'work':
                addressTypeText = 'Trabajo';
                break;
            default:
                addressTypeText = 'Otra';
        }
        
        addressCard.innerHTML = `
            <span class="address-type ${address.type}">${addressTypeText}</span>
            <div class="address-details">
                ${address.street}<br>
                ${address.city}, ${address.state} ${address.zipCode}<br>
                ${address.country}
            </div>
        `;
        
        addressesGrid.appendChild(addressCard);
        
        // Event listener para seleccionar dirección
        addressCard.addEventListener('click', () => {
            selectAddress(address.id);
        });
    });
    
    // Event listener para añadir nueva dirección
    if (newAddressBtn) {
        newAddressBtn.addEventListener('click', showAddressForm);
    }
}

// Seleccionar dirección
function selectAddress(addressId) {
    // Actualizar selección visual
    document.querySelectorAll('.address-card').forEach(card => {
        if (parseInt(card.getAttribute('data-id')) === addressId) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    
    // Actualizar ID seleccionado
    selectedAddressId = addressId;
    
    // Ocultar formulario de dirección
    hideAddressForm();
}

// Mostrar formulario de dirección
function showAddressForm() {
    savedAddressesContainer.style.display = 'none';
    addressFormFields.style.display = 'block';
    selectedAddressId = null;
}

// Ocultar formulario de dirección
function hideAddressForm() {
    if (selectedAddressId !== null) {
        savedAddressesContainer.style.display = 'block';
        addressFormFields.style.display = 'none';
    }
}

// Cargar datos del carrito
function loadCart() {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            cart = [];
        }
    }
}

// Cargar resumen del pedido
function loadOrderSummary() {
    if (!orderSummaryItems || !cart || cart.length === 0) return;
    
    // Limpiar contenedor
    orderSummaryItems.innerHTML = '';
    
    // Calcular totales
    let subtotal = 0;
    
    // Mostrar productos
    cart.forEach(item => {
        const product = findProductById(item.id);
        if (!product) return;
        
        // Crear elemento para el item
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        
        // Calcular precio total del item
        const itemPrice = parseFloat(item.price);
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;
        
        summaryItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price-qty">
                    <span>${itemPrice.toFixed(2)} x ${item.quantity}</span>
                    <span>${itemTotal.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        orderSummaryItems.appendChild(summaryItem);
    });
    
    // Calcular impuestos y total
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Actualizar resumen
    summarySubtotal.textContent = `${subtotal.toFixed(2)}`;
    summaryTax.textContent = `${tax.toFixed(2)}`;
    summaryTotal.textContent = `${total.toFixed(2)}`;
}

// Encontrar producto por ID
function findProductById(id) {
    return products.find(product => product.id === id);
}

// Configurar event listeners
function setupEventListeners() {
    // Eventos para la tarjeta
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', handleCardNumberInput);
        cardNumberInput.addEventListener('focus', () => {
            cardContainer.classList.remove('flipped');
        });
    }
    
    if (cardHolderInput) {
        cardHolderInput.addEventListener('input', handleCardHolderInput);
        cardHolderInput.addEventListener('focus', () => {
            cardContainer.classList.remove('flipped');
        });
    }
    
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', handleCardExpiryInput);
        cardExpiryInput.addEventListener('focus', () => {
            cardContainer.classList.remove('flipped');
        });
    }
    
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', handleCardCvvInput);
        cardCvvInput.addEventListener('focus', () => {
            cardContainer.classList.add('flipped');
        });
        cardCvvInput.addEventListener('blur', () => {
            cardContainer.classList.remove('flipped');
        });
    }
    
    // Tooltip del CVV
    if (cvvInfo && cvvTooltip) {
        cvvInfo.addEventListener('mouseenter', () => {
            showTooltip(cvvTooltip, cvvInfo);
        });
        
        cvvInfo.addEventListener('mouseleave', () => {
            hideTooltip(cvvTooltip);
        });
    }
    
    // Botón para usar tarjeta de prueba
    if (useTestCardBtn) {
        useTestCardBtn.addEventListener('click', fillTestCard);
    }
    
    // Botón para completar orden
    if (completeOrderBtn) {
        completeOrderBtn.addEventListener('click', handleCompleteOrder);
    }
    
    // Botón para ver recibo
    if (viewReceiptBtn) {
        viewReceiptBtn.addEventListener('click', viewReceipt);
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            userManager.logout();
            window.location.href = 'index.html';
        });
    }
}

// Manejar entrada del número de tarjeta
function handleCardNumberInput(event) {
    // Formatear número
    const result = paymentSystem.formatCardNumber(event.target.value);
    event.target.value = result.formattedValue;
    
    // Actualizar previsualización
    cardNumberPreview.textContent = result.formattedValue || '•••• •••• •••• ••••';
    
    // Actualizar icono según tipo de tarjeta
    updateCardTypeIcon(result.cardType);
}

// Manejar entrada del nombre del titular
function handleCardHolderInput(event) {
    const value = event.target.value.toUpperCase();
    cardHolderPreview.textContent = value || 'NOMBRE COMPLETO';
}

// Manejar entrada de la fecha de expiración
function handleCardExpiryInput(event) {
    // Formatear fecha
    const formattedValue = paymentSystem.formatExpiry(event.target.value);
    event.target.value = formattedValue;
    
    // Actualizar previsualización
    cardExpiryPreview.textContent = formattedValue || 'MM/YY';
}

// Manejar entrada del CVV
function handleCardCvvInput(event) {
    const value = event.target.value.replace(/\D/g, '');
    event.target.value = value;
    
    // Actualizar previsualización (con puntos)
    cardCvvPreview.textContent = value ? '•'.repeat(value.length) : '•••';
}

// Actualizar icono según tipo de tarjeta
function updateCardTypeIcon(cardType) {
    // Actualizar icono en la tarjeta
    if (cardTypeIcon) {
        cardTypeIcon.innerHTML = getCardTypeIcon(cardType);
    }
    
    // Actualizar icono en el input
    if (cardIcon) {
        cardIcon.innerHTML = getCardTypeIcon(cardType);
    }
}

// Obtener icono según tipo de tarjeta
function getCardTypeIcon(cardType) {
    switch(cardType) {
        case 'visa':
            return '<i class="fab fa-cc-visa"></i>';
        case 'mastercard':
            return '<i class="fab fa-cc-mastercard"></i>';
        case 'amex':
            return '<i class="fab fa-cc-amex"></i>';
        case 'discover':
            return '<i class="fab fa-cc-discover"></i>';
        default:
            return '<i class="far fa-credit-card"></i>';
    }
}

// Mostrar tooltip
function showTooltip(tooltip, target) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    tooltip.style.top = `${targetRect.top - tooltipRect.height - 10}px`;
    tooltip.style.left = `${targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)}px`;
    
    tooltip.classList.add('show');
}

// Ocultar tooltip
function hideTooltip(tooltip) {
    tooltip.classList.remove('show');
}

// Llenar con tarjeta de prueba
function fillTestCard() {
    const testCard = paymentSystem.getRandomTestCard();
    
    cardNumberInput.value = testCard.number;
    cardHolderInput.value = testCard.name;
    cardExpiryInput.value = testCard.expiry;
    cardCvvInput.value = testCard.cvv;
    
    // Disparar eventos para actualizar previsualización
    cardNumberInput.dispatchEvent(new Event('input'));
    cardHolderInput.dispatchEvent(new Event('input'));
    cardExpiryInput.dispatchEvent(new Event('input'));
    cardCvvInput.dispatchEvent(new Event('input'));
}

// Manejar completar orden
function handleCompleteOrder() {
    // Validar formulario
    if (!validateCheckoutForm()) {
        return;
    }
    
    // Mostrar modal de procesamiento
    showProcessingModal();
    
    // Preparar datos de pago
    const paymentData = {
        cardNumber: cardNumberInput.value.replace(/\s/g, ''),
        cardHolder: cardHolderInput.value,
        expiry: cardExpiryInput.value,
        cvv: cardCvvInput.value,
        amount: parseFloat(summaryTotal.textContent.replace(', ')),
        currency: 'MXN'
    };
    
    // Procesar pago
    paymentSystem.processPayment(paymentData)
        .then(result => {
            // Crear pedido
            createOrder(result);
            
            // Mostrar confirmación
            setTimeout(() => {
                hideProcessingModal();
                showConfirmationModal(result);
            }, 1000);
        })
        .catch(error => {
            // Ocultar modal de procesamiento
            hideProcessingModal();
            
            // Mostrar error
            showNotification(error.message || 'Error al procesar el pago', 'error');
        });
}

// Validar formulario de checkout
function validateCheckoutForm() {
    // Validar dirección
    if (selectedAddressId === null) {
        // Validar campos de dirección
        if (!firstNameInput.value.trim() || 
            !lastNameInput.value.trim() || 
            !streetInput.value.trim() || 
            !cityInput.value.trim() || 
            !stateInput.value.trim() || 
            !zipInput.value.trim() || 
            !countryInput.value.trim() || 
            !phoneInput.value.trim() || 
            !emailInput.value.trim()) {
            
            showNotification('Por favor, completa todos los campos de dirección', 'error');
            return false;
        }
    }
    
    // Validar tarjeta
    if (!cardNumberInput.value.trim() || 
        !cardHolderInput.value.trim() || 
        !cardExpiryInput.value.trim() || 
        !cardCvvInput.value.trim()) {
        
        showNotification('Por favor, completa todos los campos de la tarjeta', 'error');
        return false;
    }
    
    // Validar número de tarjeta
    if (!paymentSystem.validateCardNumber(cardNumberInput.value)) {
        showNotification('Número de tarjeta inválido', 'error');
        return false;
    }
    
    // Validar fecha de expiración
    if (!paymentSystem.validateExpiry(cardExpiryInput.value)) {
        showNotification('Fecha de expiración inválida', 'error');
        return false;
    }
    
    // Validar CVV
    const cardType = paymentSystem.detectCardType(cardNumberInput.value);
    if (!paymentSystem.validateCvv(cardCvvInput.value, cardType)) {
        showNotification('Código de seguridad inválido', 'error');
        return false;
    }
    
    return true;
}

// Mostrar modal de procesamiento
function showProcessingModal() {
    if (paymentProcessingModal) {
        paymentProcessingModal.classList.add('show');
    }
}

// Ocultar modal de procesamiento
function hideProcessingModal() {
    if (paymentProcessingModal) {
        paymentProcessingModal.classList.remove('show');
    }
}

// Mostrar modal de confirmación
function showConfirmationModal(paymentResult) {
    if (!orderConfirmedModal) return;
    
    // Actualizar información
    if (confirmedOrderId) confirmedOrderId.textContent = paymentResult.transactionId;
    if (confirmedOrderTotal) confirmedOrderTotal.textContent = `${paymentResult.amount.toFixed(2)}`;
    if (confirmedPaymentMethod) {
        confirmedPaymentMethod.textContent = `${getCardTypeName(paymentResult.cardType)} terminada en ${paymentResult.last4}`;
    }
    
    // Mostrar modal
    orderConfirmedModal.classList.add('show');
}

// Obtener nombre legible del tipo de tarjeta
function getCardTypeName(cardType) {
    switch(cardType) {
        case 'visa':
            return 'Visa';
        case 'mastercard':
            return 'Mastercard';
        case 'amex':
            return 'American Express';
        case 'discover':
            return 'Discover';
        default:
            return 'Tarjeta';
    }
}

// Crear pedido
function createOrder(paymentResult) {
    // Verificar si hay usuario autenticado
    if (userManager.isAuthenticated()) {
        const currentUser = userManager.currentUser;
        
        // Obtener dirección
        let shippingAddress;
        
        if (selectedAddressId !== null) {
            // Usar dirección seleccionada
            shippingAddress = selectedAddressId;
        } else {
            // Crear nueva dirección a partir del formulario
            const addressData = {
                type: 'home',
                street: streetInput.value.trim(),
                city: cityInput.value.trim(),
                state: stateInput.value.trim(),
                zipCode: zipInput.value.trim(),
                country: countryInput.value.trim(),
                default: false
            };
            
            // Guardar dirección si se marcó la opción
            if (saveAddressCheckbox && saveAddressCheckbox.checked) {
                const result = userManager.addAddress(currentUser.id, addressData);
                if (result.success) {
                    shippingAddress = result.address.id;
                }
            } else {
                shippingAddress = addressData;
            }
        }
        
        // Crear datos del pedido
        const orderData = {
            items: cart,
            total: paymentResult.amount,
            paymentMethod: {
                type: 'card',
                cardType: paymentResult.cardType,
                last4: paymentResult.last4,
                transactionId: paymentResult.transactionId
            },
            shippingAddress: shippingAddress
        };
        
        // Añadir pedido al historial del usuario
        userManager.addOrder(currentUser.id, orderData);
    }
    
    // Vaciar carrito
    localStorage.removeItem('shopping-cart');
}

// Ver recibo
function viewReceipt() {
    // Redirigir a la página de recibo o generarlo en el modal
    alert('Funcionalidad de recibo en desarrollo');
    
    // Cerrar modal
    orderConfirmedModal.classList.remove('show');
    
    // Redirigir a la página principal
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
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