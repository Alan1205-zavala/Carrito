// Lógica principal para la página de inicio

// Verificar estado de autenticación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si existe la clase UserManager
    if (typeof userManager !== 'undefined') {
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
    } else {
        // Mostrar botones de autenticación
        if (userActions) userActions.classList.add('hidden');
        if (authButtons) authButtons.classList.remove('hidden');
    }
}

// Manejar logout
function handleLogout() {
    if (typeof userManager !== 'undefined') {
        userManager.logout();
        updateAuthUI(false);
        
        // Recargar la página para actualizar todos los componentes
        window.location.reload();
    }
}