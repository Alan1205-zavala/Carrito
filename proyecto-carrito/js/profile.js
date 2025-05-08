if (newPassword !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    // Verificar contraseña actual
    const user = userManager.users.find(u => u.id === userManager.currentUser.id);
    
    if (!user || user.password !== currentPassword) {
        showNotification('La contraseña actual es incorrecta', 'error');
        return;
    }
    
    // Actualizar contraseña
    const result = userManager.updateProfile(userManager.currentUser.id, {
        password: newPassword
    });
    
    if (result.success) {
        // Limpiar formulario
        securityForm.reset();
        
        // Mostrar notificación
        showNotification('Contraseña actualizada correctamente', 'success');
    } else {
        showNotification(result.message || 'Error al actualizar contraseña', 'error');
    }
}

// Cargar direcciones del usuario
function loadAddresses() {
    const currentUser = userManager.currentUser;
    
    if (!currentUser || !addressesList) return;
    
    // Limpiar lista
    addressesList.innerHTML = '';
    
    // Verificar si hay direcciones
    if (!currentUser.addresses || currentUser.addresses.length === 0) {
        addressesList.innerHTML = `
            <p class="no-data-message">No hay direcciones guardadas</p>
        `;
        return;
    }
    
    // Mostrar direcciones
    currentUser.addresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card';
        
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
            ${address.default ? '<span class="address-default-badge">Predeterminada</span>' : ''}
            
            <div class="address-content">
                ${address.street}<br>
                ${address.city}, ${address.state} ${address.zipCode}<br>
                ${address.country}
            </div>
            
            <div class="address-actions">
                <button class="address-btn edit" data-id="${address.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="address-btn delete" data-id="${address.id}" ${address.default ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        
        addressesList.appendChild(addressCard);
    });
    
    // Agregar event listeners
    document.querySelectorAll('.address-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const addressId = parseInt(btn.getAttribute('data-id'));
            editAddress(addressId);
        });
    });
    
    document.querySelectorAll('.address-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const addressId = parseInt(btn.getAttribute('data-id'));
            deleteAddress(addressId);
        });
    });
}

// Mostrar formulario para añadir dirección
function showAddressForm() {
    // Título del formulario
    document.getElementById('address-form-title').textContent = 'Agregar dirección';
    
    // Resetear campos
    document.getElementById('address-id').value = '';
    document.getElementById('address-type').value = 'home';
    document.getElementById('address-street').value = '';
    document.getElementById('address-city').value = '';
    document.getElementById('address-state').value = '';
    document.getElementById('address-zip').value = '';
    document.getElementById('address-country').value = 'México';
    document.getElementById('address-default').checked = false;
    
    // Mostrar formulario
    addressesList.classList.add('hidden');
    addAddressBtn.classList.add('hidden');
    addressForm.classList.remove('hidden');
}

// Ocultar formulario de dirección
function hideAddressForm() {
    addressesList.classList.remove('hidden');
    addAddressBtn.classList.remove('hidden');
    addressForm.classList.add('hidden');
}

// Editar dirección
function editAddress(addressId) {
    const currentUser = userManager.currentUser;
    
    if (!currentUser) return;
    
    // Buscar dirección
    const address = currentUser.addresses.find(addr => addr.id === addressId);
    
    if (!address) {
        showNotification('Dirección no encontrada', 'error');
        return;
    }
    
    // Título del formulario
    document.getElementById('address-form-title').textContent = 'Editar dirección';
    
    // Completar campos
    document.getElementById('address-id').value = address.id;
    document.getElementById('address-type').value = address.type;
    document.getElementById('address-street').value = address.street;
    document.getElementById('address-city').value = address.city;
    document.getElementById('address-state').value = address.state;
    document.getElementById('address-zip').value = address.zipCode;
    document.getElementById('address-country').value = address.country;
    document.getElementById('address-default').checked = address.default;
    
    // Mostrar formulario
    addressesList.classList.add('hidden');
    addAddressBtn.classList.add('hidden');
    addressForm.classList.remove('hidden');
}

// Eliminar dirección
function deleteAddress(addressId) {
    const currentUser = userManager.currentUser;
    
    if (!currentUser) return;
    
    // Buscar índice de la dirección
    const addressIndex = currentUser.addresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
        showNotification('Dirección no encontrada', 'error');
        return;
    }
    
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
        return;
    }
    
    // No permitir eliminar la dirección predeterminada
    if (currentUser.addresses[addressIndex].default) {
        showNotification('No puedes eliminar la dirección predeterminada', 'error');
        return;
    }
    
    // Eliminar dirección
    currentUser.addresses.splice(addressIndex, 1);
    
    // Guardar cambios
    userManager.saveUsers();
    
    // Actualizar vista
    loadAddresses();
    
    // Mostrar notificación
    showNotification('Dirección eliminada correctamente', 'success');
}

// Manejar envío del formulario de dirección
function handleAddressSubmit(event) {
    event.preventDefault();
    
    // Obtener valores
    const addressId = document.getElementById('address-id').value;
    const type = document.getElementById('address-type').value;
    const street = document.getElementById('address-street').value.trim();
    const city = document.getElementById('address-city').value.trim();
    const state = document.getElementById('address-state').value.trim();
    const zipCode = document.getElementById('address-zip').value.trim();
    const country = document.getElementById('address-country').value.trim();
    const isDefault = document.getElementById('address-default').checked;
    
    // Validar campos
    if (!street || !city || !state || !zipCode || !country) {
        showNotification('Por favor, completa todos los campos obligatorios', 'error');
        return;
    }
    
    const currentUser = userManager.currentUser;
    
    if (!currentUser) return;
    
    // Verificar si es edición o creación
    if (addressId) {
        // Editar dirección existente
        const addressIndex = currentUser.addresses.findIndex(addr => addr.id === parseInt(addressId));
        
        if (addressIndex === -1) {
            showNotification('Dirección no encontrada', 'error');
            return;
        }
        
        // Si esta dirección será predeterminada, quitar la predeterminada anterior
        if (isDefault) {
            currentUser.addresses.forEach(addr => {
                addr.default = false;
            });
        }
        
        // Actualizar dirección
        currentUser.addresses[addressIndex] = {
            ...currentUser.addresses[addressIndex],
            type,
            street,
            city,
            state,
            zipCode,
            country,
            default: isDefault
        };
        
        // Guardar cambios
        userManager.saveUsers();
        
        // Actualizar vista
        hideAddressForm();
        loadAddresses();
        
        // Mostrar notificación
        showNotification('Dirección actualizada correctamente', 'success');
    } else {
        // Crear nueva dirección
        const addressData = {
            type,
            street,
            city,
            state,
            zipCode,
            country,
            default: isDefault
        };
        
        // Añadir dirección
        const result = userManager.addAddress(currentUser.id, addressData);
        
        if (result.success) {
            // Actualizar vista
            hideAddressForm();
            loadAddresses();
            
            // Mostrar notificación
            showNotification('Dirección añadida correctamente', 'success');
        } else {
            showNotification(result.message || 'Error al añadir dirección', 'error');
        }
    }
}

// Cargar pedidos del usuario
function loadOrders() {
    const currentUser = userManager.currentUser;
    
    if (!currentUser || !ordersList) return;
    
    // Limpiar lista
    ordersList.innerHTML = '';
    
    // Verificar si hay pedidos
    if (!currentUser.orders || currentUser.orders.length === 0) {
        ordersList.innerHTML = `
            <p class="no-data-message">No has realizado pedidos todavía</p>
        `;
        return;
    }
    
    // Ordenar pedidos por fecha (más recientes primero)
    const sortedOrders = [...currentUser.orders].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Mostrar pedidos
    sortedOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        // Formatear fecha
        const orderDate = new Date(order.date);
        const formattedDate = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
        
        // Contar items
        const itemsCount = order.items.reduce((total, item) => total + item.quantity, 0);
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Pedido #${order.id}</div>
                    <div class="order-date">${formattedDate}</div>
                </div>
                <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
            </div>
            
            <div class="order-summary">
                <div class="order-items">
                    <span class="order-items-count">${itemsCount}</span>
                    <span>${itemsCount === 1 ? 'producto' : 'productos'}</span>
                </div>
                <div class="order-total">Total: ${// Lógica para la página de perfil de usuario

// Referencias a elementos DOM
let userNameEls, userEmailEl, userInitialsEl;
let profileTabs, profileTabContents;
let personalInfoForm, securityForm;
let fullNameInput, emailInput, phoneInput;
let currentPasswordInput, newPasswordInput, confirmPasswordInput;
let addressesList, addAddressBtn, addressForm;
let ordersList, orderDetailsModal;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un usuario autenticado
    if (!userManager.isAuthenticated()) {
        // Redirigir a la página de login
        window.location.href = 'login.html';
        return;
    }
    
    // Obtener referencias a elementos DOM
    userNameEls = [
        document.getElementById('user-name'),
        document.getElementById('sidebar-user-name')
    ];
    
    userEmailEl = document.getElementById('sidebar-user-email');
    userInitialsEl = document.getElementById('user-initials');
    
    profileTabs = document.querySelectorAll('.profile-tab');
    profileTabContents = document.querySelectorAll('.profile-tab-content');
    
    // Formularios
    personalInfoForm = document.getElementById('personal-info-form');
    securityForm = document.getElementById('security-form');
    
    // Campos de formulario de información personal
    fullNameInput = document.getElementById('full-name');
    emailInput = document.getElementById('email');
    phoneInput = document.getElementById('phone');
    
    // Campos de formulario de seguridad
    currentPasswordInput = document.getElementById('current-password');
    newPasswordInput = document.getElementById('new-password');
    confirmPasswordInput = document.getElementById('confirm-password');
    
    // Elementos de direcciones
    addressesList = document.getElementById('addresses-list');
    addAddressBtn = document.getElementById('add-address-btn');
    addressForm = document.getElementById('address-form');
    
    // Elementos de pedidos
    ordersList = document.getElementById('orders-list');
    orderDetailsModal = document.getElementById('order-details-modal');
    
    // Botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    
    // Cargar datos del usuario
    loadUserData();
    
    // Configurar event listeners
    setupEventListeners();
});

// Cargar datos del usuario
function loadUserData() {
    const currentUser = userManager.currentUser;
    
    if (!currentUser) return;
    
    // Actualizar nombre e iniciales
    userNameEls.forEach(el => {
        if (el) el.textContent = currentUser.name;
    });
    
    // Actualizar email
    if (userEmailEl) userEmailEl.textContent = currentUser.email;
    
    // Actualizar iniciales
    if (userInitialsEl) {
        const initials = getInitials(currentUser.name);
        userInitialsEl.textContent = initials;
    }
    
    // Completar formulario de información personal
    if (fullNameInput) fullNameInput.value = currentUser.name;
    if (emailInput) emailInput.value = currentUser.email;
    if (phoneInput && currentUser.phone) phoneInput.value = currentUser.phone;
    
    // Cargar direcciones
    loadAddresses();
    
    // Cargar pedidos
    loadOrders();
}

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para cambiar entre pestañas
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Event listener para formulario de información personal
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    }
    
    // Event listener para formulario de seguridad
    if (securityForm) {
        securityForm.addEventListener('submit', handleSecuritySubmit);
    }
    
    // Event listeners para direcciones
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', showAddressForm);
    }
    
    if (addressForm) {
        const closeBtn = document.getElementById('close-address-form');
        const cancelBtn = document.getElementById('cancel-address');
        
        addressForm.addEventListener('submit', handleAddressSubmit);
        closeBtn.addEventListener('click', hideAddressForm);
        cancelBtn.addEventListener('click', hideAddressForm);
    }
    
    // Event listener para cerrar modal de detalles de pedido
    if (orderDetailsModal) {
        const closeBtn = orderDetailsModal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            orderDetailsModal.classList.remove('show');
        });
    }
    
    // Event listener para logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Función para cambiar entre pestañas
function switchTab(tabName) {
    // Actualizar botones de pestañas
    profileTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Actualizar contenido visible
    profileTabContents.forEach(content => {
        if (content.id === `${tabName}-content`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Manejar envío del formulario de información personal
function handlePersonalInfoSubmit(event) {
    event.preventDefault();
    
    // Obtener valores
    const name = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    
    // Validar campos
    if (!name || !email) {
        showNotification('Por favor, completa los campos obligatorios', 'error');
        return;
    }
    
    // Actualizar perfil
    const result = userManager.updateProfile(userManager.currentUser.id, {
        name,
        email,
        phone
    });
    
    if (result.success) {
        // Recargar datos
        loadUserData();
        
        // Mostrar notificación
        showNotification('Información personal actualizada correctamente', 'success');
    } else {
        showNotification(result.message || 'Error al actualizar información', 'error');
    }
}

// Manejar envío del formulario de seguridad
function handleSecuritySubmit(event) {
    event.preventDefault();
    
    // Obtener valores
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validar campos
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;