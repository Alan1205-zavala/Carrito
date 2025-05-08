// Sistema de gestión de usuarios

// Definir estructura de usuarios predeterminados
const defaultUsers = [
    {
        id: 1,
        name: "Cliente Demo",
        email: "cliente@techshop.com",
        password: "cliente123", // En un sistema real, esto estaría encriptado
        role: "customer",
        createdAt: "2025-01-01T00:00:00.000Z",
        orders: [],
        addresses: [
            {
                id: 1,
                type: "home",
                street: "Calle Principal 123",
                city: "Campeche",
                state: "Campeche",
                zipCode: "24000",
                country: "México",
                default: true
            }
        ]
    },
    {
        id: 2,
        name: "Administrador",
        email: "admin@techshop.com",
        password: "admin123",
        role: "admin",
        createdAt: "2025-01-01T00:00:00.000Z",
        orders: [],
        addresses: []
    },
    {
        id: 3,
        name: "Proveedor",
        email: "proveedor@techshop.com",
        password: "proveedor123",
        role: "provider",
        createdAt: "2025-01-01T00:00:00.000Z",
        orders: [],
        addresses: []
    }
];

// Clase para manejar usuarios
class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        
        // Si no hay usuarios, cargar los predeterminados
        if (this.users.length === 0) {
            this.users = [...defaultUsers];
            this.saveUsers();
        }
    }
    
    // Cargar usuarios desde localStorage
    loadUsers() {
        const storedUsers = localStorage.getItem('techshop-users');
        return storedUsers ? JSON.parse(storedUsers) : [];
    }
    
    // Guardar usuarios en localStorage
    saveUsers() {
        localStorage.setItem('techshop-users', JSON.stringify(this.users));
    }
    
    // Cargar usuario actual desde sessionStorage
    loadCurrentUser() {
        const currentUser = sessionStorage.getItem('techshop-current-user');
        return currentUser ? JSON.parse(currentUser) : null;
    }
    
    // Guardar usuario actual en sessionStorage
    saveCurrentUser(user) {
        if (user) {
            // No guardar la contraseña en la sesión activa
            const { password, ...userWithoutPassword } = user;
            sessionStorage.setItem('techshop-current-user', JSON.stringify(userWithoutPassword));
            this.currentUser = userWithoutPassword;
        } else {
            sessionStorage.removeItem('techshop-current-user');
            this.currentUser = null;
        }
    }
    
    // Verificar si un usuario está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    // Verificar si el usuario actual tiene un rol específico
    hasRole(role) {
        return this.isAuthenticated() && this.currentUser.role === role;
    }
    
    // Verificar si un email ya está registrado
    isEmailRegistered(email) {
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }
    
    // Login de usuario
    login(email, password, rememberMe = false) {
        const user = this.users.find(
            user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
        );
        
        if (user) {
            this.saveCurrentUser(user);
            
            // Si se marca "recordarme", guardar email en localStorage
            if (rememberMe) {
                localStorage.setItem('techshop-remembered-user', email);
            } else {
                localStorage.removeItem('techshop-remembered-user');
            }
            
            return { success: true, user: { ...user, password: undefined } };
        }
        
        return { success: false, message: "Credenciales incorrectas" };
    }
    
    // Logout de usuario
    logout() {
        this.saveCurrentUser(null);
        return { success: true };
    }
    
    // Registrar un nuevo usuario
    register(userData) {
        // Verificar si el email ya está registrado
        if (this.isEmailRegistered(userData.email)) {
            return { success: false, message: "Este correo electrónico ya está registrado" };
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: this.getNextUserId(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: "customer", // Por defecto, todos los nuevos usuarios son clientes
            createdAt: new Date().toISOString(),
            orders: [],
            addresses: []
        };
        
        // Añadir a la lista de usuarios
        this.users.push(newUser);
        
        // Guardar cambios
        this.saveUsers();
        
        // Iniciar sesión automáticamente
        this.saveCurrentUser(newUser);
        
        return { success: true, user: { ...newUser, password: undefined } };
    }
    
    // Obtener el siguiente ID disponible
    getNextUserId() {
        return this.users.length > 0 
            ? Math.max(...this.users.map(user => user.id)) + 1 
            : 1;
    }
    
    // Obtener usuario por ID
    getUserById(id) {
        const user = this.users.find(user => user.id === id);
        if (user) {
            // No devolver la contraseña
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }
    
    // Obtener usuario por email
    getUserByEmail(email) {
        const user = this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
        if (user) {
            // No devolver la contraseña
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }
    
    // Actualizar perfil de usuario
    updateProfile(userId, userData) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: "Usuario no encontrado" };
        }
        
        // Si se está cambiando el email, verificar que no esté ya registrado
        if (userData.email && 
            userData.email.toLowerCase() !== this.users[userIndex].email.toLowerCase() && 
            this.isEmailRegistered(userData.email)) {
            return { success: false, message: "Este correo electrónico ya está registrado" };
        }
        
        // Actualizar datos
        this.users[userIndex] = {
            ...this.users[userIndex],
            name: userData.name || this.users[userIndex].name,
            email: userData.email || this.users[userIndex].email,
            // Solo actualizar contraseña si se proporciona
            password: userData.password || this.users[userIndex].password
        };
        
        // Guardar cambios
        this.saveUsers();
        
        // Si el usuario actual es el que se está actualizando, actualizar también la sesión
        if (this.currentUser && this.currentUser.id === userId) {
            this.saveCurrentUser(this.users[userIndex]);
        }
        
        return { success: true, user: { ...this.users[userIndex], password: undefined } };
    }
    
    // Añadir una dirección a un usuario
    addAddress(userId, addressData) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: "Usuario no encontrado" };
        }
        
        // Crear nueva dirección
        const newAddress = {
            id: this.getNextAddressId(userId),
            type: addressData.type || "home",
            street: addressData.street,
            city: addressData.city,
            state: addressData.state,
            zipCode: addressData.zipCode,
            country: addressData.country || "México",
            default: addressData.default || false
        };
        
        // Si esta dirección es predeterminada, quitar la predeterminada anterior
        if (newAddress.default) {
            this.users[userIndex].addresses.forEach(addr => {
                addr.default = false;
            });
        }
        
        // Añadir dirección
        this.users[userIndex].addresses.push(newAddress);
        
        // Guardar cambios
        this.saveUsers();
        
        // Actualizar sesión si es el usuario actual
        if (this.currentUser && this.currentUser.id === userId) {
            this.saveCurrentUser(this.users[userIndex]);
        }
        
        return { success: true, address: newAddress };
    }
    
    // Obtener el siguiente ID disponible para direcciones
    getNextAddressId(userId) {
        const user = this.users.find(user => user.id === userId);
        if (!user) return 1;
        
        return user.addresses.length > 0 
            ? Math.max(...user.addresses.map(addr => addr.id)) + 1 
            : 1;
    }
    
    // Añadir una orden al historial de un usuario
    addOrder(userId, orderData) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: "Usuario no encontrado" };
        }
        
        // Crear nueva orden
        const newOrder = {
            id: this.getNextOrderId(userId),
            date: new Date().toISOString(),
            status: "completed",
            total: orderData.total,
            items: orderData.items,
            paymentMethod: orderData.paymentMethod,
            shippingAddress: orderData.shippingAddress
        };
        
        // Añadir orden
        this.users[userIndex].orders.push(newOrder);
        
        // Guardar cambios
        this.saveUsers();
        
        // Actualizar sesión si es el usuario actual
        if (this.currentUser && this.currentUser.id === userId) {
            this.saveCurrentUser(this.users[userIndex]);
        }
        
        return { success: true, order: newOrder };
    }
    
    // Obtener el siguiente ID disponible para órdenes
    getNextOrderId(userId) {
        const user = this.users.find(user => user.id === userId);
        if (!user) return 1;
        
        return user.orders.length > 0 
            ? Math.max(...user.orders.map(order => order.id)) + 1 
            : 1;
    }
    
    // Obtener el email recordado (para la función "recordarme")
    getRememberedEmail() {
        return localStorage.getItem('techshop-remembered-user');
    }
}

// Crear una instancia global del gestor de usuarios
const userManager = new UserManager();

// Exportar para usar en otros archivos
window.userManager = userManager;