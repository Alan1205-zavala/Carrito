# TechShop - Tienda Online Completa

Una plataforma de comercio electrónico completa con gestión de usuarios, carrito de compras, sistema de pagos ficticio y gestión de inventario.

## Características Principales

### 1. Sistema de Usuarios

- **Registro e inicio de sesión** de clientes
- **Panel de administración** para proveedores
- **Perfiles de usuario** con gestión de direcciones
- **Historial de pedidos** para clientes

### 2. Carrito de Compras

- **Añadir/eliminar productos** y modificar cantidades
- **Persistencia** del carrito en localStorage
- **Cálculo de subtotales, impuestos y total**
- **Validación de stock** para evitar compras de productos agotados
- **Indicadores visuales** de producto agotado o con poco stock

### 3. Proceso de Checkout

- **Selección de dirección de envío** (existente o nueva)
- **Sistema de pago ficticio** con validación de tarjetas
- **Visualización interactiva** de tarjeta de crédito
- **Generación de pedidos** y recibos

### 4. Gestión de Inventario

- **Panel de Proveedores** para gestionar stock
- **Reabastecimiento** de productos
- **Indicadores** de productos agotados o con poco stock
- **Sincronización** automática entre el panel y la tienda

## Tipos de Usuarios

### 1. Cliente

- Navegar por productos
- Registrarse e iniciar sesión
- Gestionar perfil y direcciones
- Añadir productos al carrito
- Realizar compras
- Ver historial de pedidos

### 2. Proveedor/Administrador

- Acceder al panel de proveedores
- Ver productos con poco stock o agotados
- Reabastecer productos
- Monitorear estadísticas de inventario

## Flujo de Compra

1. **Exploración**: El usuario navega por los productos disponibles
2. **Selección**: Añade productos al carrito
3. **Checkout**: Procede a finalizar la compra
4. **Envío**: Selecciona o ingresa la dirección de envío
5. **Pago**: Ingresa datos de tarjeta (ficticia)
6. **Confirmación**: Recibe confirmación del pedido y un recibo

## Cuentas de Demostración

### Cliente

- **Email**: cliente@techshop.com
- **Contraseña**: cliente123

### Administrador

- **Email**: admin@techshop.com
- **Contraseña**: admin123

### Proveedor

- **Email**: proveedor@techshop.com
- **Contraseña**: proveedor123
- **Alternativa**: Usuario "proveedor", Contraseña "admin123"

## Tarjetas de Prueba

Para realizar pagos de prueba, puedes usar cualquiera de estas tarjetas:

- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3714 496353 98431
- **Discover**: 6011 1111 1111 1117

Para todas las tarjetas:

- **Fecha de expiración**: Cualquier fecha futura (ej. 12/25)
- **CVV**: Cualquier número de 3 dígitos (4 para Amex)
- **Nombre del titular**: Cualquier nombre

## Estructura del Proyecto

```
techshop/
|-- index.html             # Página principal con productos
|-- login.html             # Página de inicio de sesión y registro
|-- profile.html           # Página de perfil de usuario
|-- checkout.html          # Página de checkout
|-- providers.html         # Panel de proveedores
|-- css/
|   |-- styles.css         # Estilos principales
|   |-- cart.css           # Estilos del carrito
|   |-- login.css          # Estilos de login
|   |-- profile.css        # Estilos de perfil
|   |-- checkout.css       # Estilos de checkout
|   |-- providers.css      # Estilos del panel de proveedores
|-- js/
|   |-- products.js        # Datos y lógica de productos
|   |-- users.js           # Sistema de gestión de usuarios
|   |-- cart.js            # Lógica del carrito
|   |-- payment.js         # Sistema de pagos ficticio
|   |-- checkout.js        # Lógica de checkout
|   |-- profile.js         # Lógica de perfil
|   |-- providers.js       # Lógica del panel de proveedores
|   |-- index.js           # Lógica de la página principal
```

## Tecnologías Utilizadas

- **HTML5, CSS3, JavaScript** (vanilla, sin frameworks)
- **LocalStorage** para persistencia de datos
- **SessionStorage** para gestión de sesiones
- **FontAwesome** para iconos
- **Google Fonts** para tipografías

## Instalación y Uso

1. Clona o descarga este repositorio
2. Organiza los archivos según la estructura indicada
3. Abre `index.html` en tu navegador o usa un servidor local (recomendado)

## Características Avanzadas

### Carrito de Compras

- Validación de stock en tiempo real
- Actualización automática de totales
- Animaciones y notificaciones interactivas

### Sistema de Pagos

- Validación de tarjetas mediante algoritmo de Luhn
- Detección automática del tipo de tarjeta
- Visualización interactiva de la tarjeta
- Simulación de procesamiento de pago

### Gestión de Perfil

- Múltiples direcciones por usuario
- Visualización detallada de pedidos
- Seguridad de contraseña

### Panel de Proveedores

- Filtrado de productos por estado de stock
- Estadísticas de inventario
- Proceso simplificado de reabastecimiento

## Personalización

- Modifica los colores principales en las variables CSS en `styles.css`
- Actualiza los productos en el archivo `products.js`
- Añade nuevos tipos de usuarios en `users.js`
- Ajusta el porcentaje de impuestos cambiando la variable `taxRate` en `cart.js`

## Limitaciones

- Al ser un proyecto de demostración, todos los datos se almacenan localmente
- No hay backend real para procesar pagos o gestionar usuarios
- No hay persistencia entre diferentes navegadores o dispositivos
- El sistema está diseñado para fines educativos y no debe usarse en producción sin las medidas de seguridad adecuadas

## Desarrollo Futuro

- Implementar un backend real con base de datos
- Añadir autenticación segura
- Integrar APIs de pago reales
- Implementar un sistema de búsqueda y filtrado de productos
- Añadir más roles y permisos
- Desarrollar un sistema de notificaciones en tiempo real
