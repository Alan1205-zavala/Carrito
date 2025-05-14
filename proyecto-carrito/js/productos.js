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