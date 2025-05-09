// Lógica para la página de contacto

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar estado de autenticación
    if (typeof userManager !== 'undefined') {
        checkAuthStatus();
    }
    
    // Configurar formulario de contacto
    setupContactForm();
    
    // Configurar evento para el botón de checkout
    setupCheckoutButton();
});

// Verificar estado de autenticación
function checkAuthStatus() {
    // Verificar si hay un usuario autenticado
    if (userManager.isAuthenticated()) {
        updateAuthUI(true, userManager.currentUser.name);
        
        // Pre-llenar campos del formulario con datos del usuario
        prefillContactForm(userManager.currentUser);
        
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

// Pre-llenar formulario con datos del usuario
function prefillContactForm(user) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    if (nameInput && user.name) {
        nameInput.value = user.name;
    }
    
    if (emailInput && user.email) {
        emailInput.value = user.email;
    }
}

// Configurar formulario de contacto
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Obtener datos del formulario
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value || 'No proporcionado',
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // En un sistema real, aquí enviaríamos los datos al servidor
        // Para este demo, simulamos el envío
        
        // Mostrar mensaje de carga
        showNotification('Enviando mensaje...', 'info');
        
        // Simular tiempo de procesamiento
        setTimeout(() => {
            // Resetear formulario
            contactForm.reset();
            
            // Si hay usuario autenticado, volver a prellenar sus datos
            if (userManager && userManager.isAuthenticated()) {
                prefillContactForm(userManager.currentUser);
            }
            
            // Mostrar mensaje de éxito
            showNotification('¡Mensaje enviado correctamente! Te responderemos a la brevedad.', 'success');
            
            // Para propositos de demostración, mostramos los datos en consola
            console.log('Mensaje enviado:', formData);
        }, 1500);
    });
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