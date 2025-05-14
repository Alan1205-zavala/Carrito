// Función para editar un producto existente
function editProduct(productId) {
    // Abrir el modal con los datos del producto
    openProductModal(productId);
}

// Manejar el envío del formulario de producto
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
    
    console.log('Datos del formulario:', productData);
    console.log('Modo edición:', isEditing);
    console.log('ID del producto:', currentProductId);
    
    if (isEditing && currentProductId) {
        // Modo edición
        updateProduct(currentProductId, productData);
    } else {
        // Modo creación
        addProduct(productData);
    }
    
    // Cerrar modal
    closeProductModal();
}

// Función para actualizar un producto existente
function updateProduct(productId, productData) {
    console.log('Actualizando producto con ID:', productId);
    console.log('Datos para actualizar:', productData);
    
    // Convertir ID a número para asegurar la comparación correcta
    productId = parseInt(productId);
    
    // Buscar índice del producto
    const productIndex = products.findIndex(p => p.id === productId);
    
    console.log('Índice del producto encontrado:', productIndex);
    
    if (productIndex === -1) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    
    // Hacer una copia del producto original
    const originalProduct = { ...products[productIndex] };
    console.log('Producto original:', originalProduct);
    
    // Actualizar producto manteniendo el ID
    products[productIndex] = {
        id: originalProduct.id,
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
    } else if (originalProduct.originalPrice) {
        // Mantener el valor original si no se proporciona uno nuevo
        products[productIndex].originalPrice = originalProduct.originalPrice;
    }
    
    if (productData.discount) {
        products[productIndex].discount = productData.discount;
    } else if (originalProduct.discount) {
        // Mantener el valor original si no se proporciona uno nuevo
        products[productIndex].discount = originalProduct.discount;
    }
    
    console.log('Producto actualizado:', products[productIndex]);
    
    // Guardar en localStorage
    saveProducts();
    
    // Recargar productos
    loadProducts();
    
    // Actualizar visualización de productos si estamos en la página principal
    if (typeof displayProducts === 'function') {
        displayProducts();
    }
    
    // Mostrar notificación
    showNotification(`Producto "${productData.name}" actualizado correctamente`, 'success');
}

// Guardar productos en localStorage
function saveProducts() {
    console.log('Guardando productos en localStorage:', products);
    localStorage.setItem('products', JSON.stringify(products));
}

// Variables para el modal
let isEditing = false;
let currentProductId = null;
let productForm;
let productModal;

document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a elementos DOM
    productForm = document.getElementById('product-form');
    productModal = document.getElementById('product-modal');
    
    // Configurar event listeners
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Botones para abrir y cerrar el modal
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal());
    }
    
    const closeProductModalBtn = document.getElementById('close-product-modal');
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }
    
    const cancelProductBtn = document.getElementById('cancel-product-btn');
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductModal);
    }
    
    // Cargar productos en la tabla
    loadProducts();
});

// Función para cargar productos en la tabla
function loadProducts() {
    const tableBody = document.getElementById('products-table-body');
    const noProductsMessage = document.getElementById('no-products-message');
    
    if (!tableBody || !noProductsMessage) return;
    
    // Limpiar tabla
    tableBody.innerHTML = '';
    
    // Verificar si hay productos
    if (products.length === 0) {
        noProductsMessage.style.display = 'block';
        document.querySelector('.products-table-container').style.display = 'none';
        return;
    }
    
    // Mostrar tabla y ocultar mensaje
    noProductsMessage.style.display = 'none';
    document.querySelector('.products-table-container').style.display = 'block';
    
    // Cargar productos en la tabla
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Determinar clase según stock
        let stockStatus, stockClass;
        if (product.stock <= 0) {
            stockStatus = 'Agotado';
            stockClass = 'out-of-stock';
        } else if (product.stock <= 10) {
            stockStatus = 'Poco stock';
            stockClass = 'low-stock';
        } else {
            stockStatus = 'En stock';
            stockClass = 'in-stock';
        }
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td class="cell-image"><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td class="cell-price">$${product.price.toFixed(2)}</td>
            <td class="cell-discount">${product.discount ? `${product.discount}%` : '-'}</td>
            <td class="cell-stock">
                <span class="stock-indicator ${stockClass}">${stockStatus} (${product.stock})</span>
            </td>
            <td>${getCategoryName(product.category || '')}</td>
            <td class="cell-actions">
                <button class="action-btn btn-edit" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-delete" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar event listeners a botones de acción
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.getAttribute('data-id'));
            const product = findProductById(productId);
            
            if (product) {
                // Completar datos en el modal de confirmación
                document.getElementById('delete-product-name').textContent = product.name;
                
                // Mostrar modal de confirmación
                document.getElementById('confirm-delete-modal').classList.add('show');
                
                // Configurar botón de confirmación
                document.getElementById('confirm-delete-btn').onclick = () => {
                    deleteProduct(productId);
                    document.getElementById('confirm-delete-modal').classList.remove('show');
                };
                
                // Configurar botones para cerrar/cancelar
                document.getElementById('close-confirm-modal').onclick = () => {
                    document.getElementById('confirm-delete-modal').classList.remove('show');
                };
                
                document.getElementById('cancel-delete-btn').onclick = () => {
                    document.getElementById('confirm-delete-modal').classList.remove('show');
                };
            }
        });
    });
}

// Función para obtener nombre de categoría
function getCategoryName(category) {
    switch(category) {
        case 'smartphones': return 'Smartphones';
        case 'laptops': return 'Laptops';
        case 'audio': return 'Audio';
        case 'accessories': return 'Accesorios';
        default: return 'Sin categoría';
    }
}

// Función para abrir modal de producto
function openProductModal(productId = null) {
    isEditing = !!productId;
    currentProductId = productId;
    
    // Actualizar título del modal
    document.getElementById('modal-title').textContent = isEditing ? 'Editar Producto' : 'Agregar Producto';
    
    // Resetear formulario
    productForm.reset();
    
    // Si es edición, completar datos del producto
    if (isEditing) {
        const product = findProductById(productId);
        
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-original-price').value = product.originalPrice || '';
            document.getElementById('product-discount').value = product.discount || '';
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-rating').value = product.rating;
            document.getElementById('product-reviews').value = product.reviewCount;
            document.getElementById('product-category').value = product.category || '';
        }
    }
    
    // Mostrar modal
    productModal.classList.add('show');
}

// Función para cerrar modal de producto
function closeProductModal() {
    productModal.classList.remove('show');
    isEditing = false;
    currentProductId = null;
}

// Función para eliminar un producto
function deleteProduct(productId) {
    // Filtrar productos para eliminar el seleccionado
    const newProducts = products.filter(product => product.id !== productId);
    
    // Actualizar array de productos
    products.length = 0;
    products.push(...newProducts);
    
    // Guardar en localStorage
    saveProducts();
    
    // Recargar productos
    loadProducts();
    
    // Mostrar notificación
    showNotification(`Producto eliminado correctamente`, 'success');
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

// Función para agregar un nuevo producto
function addProduct(productData) {
    // Crear nuevo producto
    const newProduct = {
        id: getNextProductId(),
        name: productData.name,
        price: productData.price,
        description: productData.description,
        image: productData.image,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        stock: productData.stock,
        category: productData.category
    };
    
    // Agregar campos opcionales si existen
    if (productData.originalPrice) {
        newProduct.originalPrice = productData.originalPrice;
    }
    
    if (productData.discount) {
        newProduct.discount = productData.discount;
    }
    
    // Añadir a la lista de productos
    products.push(newProduct);
    
    // Guardar en localStorage
    saveProducts();
    
    // Recargar productos
    loadProducts();
    
    // Mostrar notificación
    showNotification(`Producto "${productData.name}" agregado correctamente`, 'success');
}

// Obtener el siguiente ID disponible para productos
function getNextProductId() {
    return products.length > 0 
        ? Math.max(...products.map(p => p.id)) + 1 
        : 1;
}
