// Lógica para la página de login y registro

// Referencias a elementos DOM
let loginForm, registerForm, tabButtons;
let loginEmail, loginPassword, rememberMe;
let registerName, registerEmail, registerPassword, registerPasswordConfirm, acceptTerms;
let strengthBar, strengthText;
let demoButtons, togglePasswordButtons;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los formularios
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    
    // Obtener referencias a los campos de login
    loginEmail = document.getElementById('login-email');
    loginPassword = document.getElementById('login-password');
    rememberMe = document.getElementById('remember-me');
    
    // Obtener referencias a los campos de registro
    registerName = document.getElementById('register-name');
    registerEmail = document.getElementById('register-email');
    registerPassword = document.getElementById('register-password');
    registerPasswordConfirm = document.getElementById('register-password-confirm');
    acceptTerms = document.getElementById('accept-terms');
    
    // Obtener referencias a los indicadores de fortaleza de contraseña
    strengthBar = document.querySelector('.strength-bar');
    strengthText = document.querySelector('.strength-text');
    
    // Obtener referencias a los botones de demo
    demoButtons = document.querySelectorAll('.btn-demo');
    
    // Obtener referencias a los botones para mostrar/ocultar contraseña
    togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    // Obtener referencias a los botones de pestañas
    tabButtons = document.querySelectorAll('.auth-tab');
    
    // Verificar si ya hay un usuario autenticado
    if (userManager.isAuthenticated()) {
        redirectToHome();
        return;
    }
    
    // Cargar email recordado si existe
    const rememberedEmail = userManager.getRememberedEmail();
    if (rememberedEmail) {
        loginEmail.value = rememberedEmail;
        rememberMe.checked = true;
    }
    
    // Agregar event listeners
    setupEventListeners();
});

// Configurar todos los event listeners
function setupEventListeners() {
    // Event listener para cambiar entre pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Event listener para formulario de login
    loginForm.addEventListener('submit', handleLogin);
    
    // Event listener para formulario de registro
    registerForm.addEventListener('submit', handleRegister);
    
    // Event listener para botones de demo
    demoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const role = button.getAttribute('data-role');
            loginWithDemo(role);
        });
    });
    
    // Event listener para verificar fortaleza de contraseña
    registerPassword.addEventListener('input', checkPasswordStrength);
    
    // Event listener para botones de mostrar/ocultar contraseña
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', togglePasswordVisibility);
    });
}

// Función para cambiar entre pestañas
function switchTab(tabName) {
    // Actualizar botones de pestañas
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Actualizar formularios
    if (tabName === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    }
}

// Función para manejar el login
function handleLogin(event) {
    event.preventDefault();
    
    // Obtener valores
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const remember = rememberMe.checked;
    
    // Validar campos
    if (!email || !password) {
        showNotification('Por favor, completa todos los campos', 'error');
        return;
    }
    
    // Intentar login
    const result = userManager.login(email, password, remember);
    
    if (result.success) {
        showNotification('Login exitoso. Redirigiendo...', 'success');
        setTimeout(redirectToHome, 1000);
    } else {
        showNotification(result.message || 'Credenciales incorrectas', 'error');
    }
}

// Función para manejar el registro
function handleRegister(event) {
    event.preventDefault();
    
    // Obtener valores
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const passwordConfirm = registerPasswordConfirm.value;
    const terms = acceptTerms.checked;
    
    // Validar campos
    if (!name || !email || !password || !passwordConfirm) {
        showNotification('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (!terms) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        return;
    }
    
    // Intentar registro
    const result = userManager.register({
        name,
        email,
        password
    });
    
    if (result.success) {
        showNotification('Registro exitoso. Redirigiendo...', 'success');
        setTimeout(redirectToHome, 1000);
    } else {
        showNotification(result.message || 'Error al registrar usuario', 'error');
    }
}

// Función para login con cuenta de demo
function loginWithDemo(role) {
    let email, password;
    
    if (role === 'customer') {
        email = 'cliente@techshop.com';
        password = 'cliente123';
    } else if (role === 'admin') {
        email = 'admin@techshop.com';
        password = 'admin123';
    } else {
        return;
    }
    
    // Completar formulario
    loginEmail.value = email;
    loginPassword.value = password;
    
    // Simular click en botón de login
    setTimeout(() => {
        const result = userManager.login(email, password, false);
        
        if (result.success) {
            showNotification(`Login como ${role} exitoso. Redirigiendo...`, 'success');
            setTimeout(redirectToHome, 1000);
        } else {
            showNotification('Error al iniciar sesión con cuenta demo', 'error');
        }
    }, 500);
}

// Función para verificar fortaleza de contraseña
function checkPasswordStrength() {
    const password = registerPassword.value;
    let strength = 0;
    let message = '';
    
    // Criterios de fortaleza
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    
    // Actualizar barra y mensaje
    switch(strength) {
        case 0:
            strengthBar.style.width = '20%';
            strengthBar.style.backgroundColor = '#ff6b6b';
            message = 'Contraseña muy débil';
            break;
        case 1:
            strengthBar.style.width = '40%';
            strengthBar.style.backgroundColor = '#ff9f43';
            message = 'Contraseña débil';
            break;
        case 2:
            strengthBar.style.width = '60%';
            strengthBar.style.backgroundColor = '#feca57';
            message = 'Contraseña media';
            break;
        case 3:
            strengthBar.style.width = '80%';
            strengthBar.style.backgroundColor = '#6ab04c';
            message = 'Contraseña fuerte';
            break;
        case 4:
            strengthBar.style.width = '100%';
            strengthBar.style.backgroundColor = '#2ecc71';
            message = 'Contraseña muy fuerte';
            break;
    }
    
    strengthText.textContent = message;
    strengthText.style.color = strengthBar.style.backgroundColor;
}

// Función para mostrar/ocultar contraseña
function togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const input = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
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

// Función para redirigir a la página principal
function redirectToHome() {
    window.location.href = 'index.html';
}