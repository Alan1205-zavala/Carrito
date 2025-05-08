// Datos de productos
const products = [
    {
        id: 1,
        name: "Smartphone Galaxy S23",
        price: 14999.00,
        originalPrice: 17999.00,
        description: "Smartphone de alta gama con cámara de 108MP, pantalla AMOLED y procesador de última generación.",
        image: "https://andro4all.com/hero/2022/10/Galaxy-S23-specs-portada.jpg?width=768&aspect_ratio=16:9&format=nowebp3",
        rating: 4.8,
        reviewCount: 156,
        discount: 16,
        stock: 25
    },
    {
        id: 2,
        name: "Laptop Pro X15",
        price: 24999.00,
        originalPrice: 29999.00,
        description: "Potente laptop con procesador Intel i9, 32GB RAM, 1TB SSD y tarjeta gráfica dedicada.",
        image: "https://iqrorwxhlojrll5q-static.micyjz.com/cloud/jqBpkKqnljSRkkiimkiojo/1.jpg",
        rating: 4.9,
        reviewCount: 87,
        discount: 17,
        stock: 10
    },
    {
        id: 3,
        name: "Audífonos Bluetooth ANC",
        price: 2499.00,
        originalPrice: 3999.00,
        description: "Audífonos inalámbricos con cancelación activa de ruido, 30 horas de batería y calidad premium.",
        image: "https://cdn1.coppel.com/images/catalog/pm/2218733-5.jpg",
        rating: 4.7,
        reviewCount: 312,
        discount: 37,
        stock: 50
    },
    {
        id: 4,
        name: "Smart TV 55\" 4K UHD",
        price: 11999.00,
        originalPrice: 13999.00,
        description: "Televisor 4K con HDR, sistema operativo inteligente y sonido envolvente.",
        image: "https://andro4all.com/hero/2025/04/samsung-55q70d.jpg?width=1200",
        rating: 4.6,
        reviewCount: 74,
        discount: 14,
        stock: 15
    },
    {
        id: 5,
        name: "Consola de Videojuegos 4K",
        price: 8999.00,
        originalPrice: 9999.00,
        description: "Consola de última generación con capacidad 4K, 1TB de almacenamiento y control inalámbrico.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmoCFgf0jMyMqncqsgac8cEdNvjKOXFmJ8Vg&s",
        rating: 4.9,
        reviewCount: 238,
        discount: 10,
        stock: 20
    },
    {
        id: 6,
        name: "Tablet Pro 10.5\"",
        price: 7499.00,
        originalPrice: 8999.00,
        description: "Tablet con pantalla retina, procesador potente, ideal para productividad y entretenimiento.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8HogGuErzwBE0U1aiCgLCSJceDJ-VdF4cSg&s",
        rating: 4.5,
        reviewCount: 112,
        discount: 17,
        stock: 30
    },
    {
        id: 7,
        name: "Smartwatch Series 8",
        price: 4999.00,
        originalPrice: 5999.00,
        description: "Reloj inteligente con monitor cardíaco, GPS, resistente al agua y batería de larga duración.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNhBbrBYeuPeruKNmPL5yqkYZ_d3cWRCjjVA&s",
        rating: 4.6,
        reviewCount: 189,
        discount: 17,
        stock: 40
    },
    {
        id: 8,
        name: "Cámara DSLR 24MP",
        price: 13999.00,
        originalPrice: 15999.00,
        description: "Cámara profesional con sensor CMOS, grabación 4K y conectividad Wi-Fi para transferencia inmediata.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC-ewyZOllY6cfmeRLnHRL-NR3ndueeTYEDA&s",
        rating: 4.7,
        reviewCount: 96,
        discount: 12,
        stock: 0
    }
];

// Función para mostrar los productos en la página
function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    
    // Limpiar el contenedor
    productsContainer.innerHTML = '';
    
    // Crear tarjetas de productos
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        
        // Verificar si hay stock disponible
        const outOfStock = product.stock <= 0;
        const stockClass = outOfStock ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : '';
        
        // Crear estructura de la tarjeta
        productCard.innerHTML = `
            <div class="product-img ${stockClass}">
                ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                ${outOfStock ? `<div class="stock-badge">Agotado</div>` : product.stock <= 5 ? `<div class="stock-badge low">Quedan ${product.stock}</div>` : ''}
                <img src="${product.image}" alt="${product.name}">
                ${outOfStock ? `<div class="out-of-stock-overlay"><span>Agotado</span></div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="rating">
                        <div class="stars">
                            ${getStarsHTML(product.rating)}
                        </div>
                        <span class="rating-count">(${product.reviewCount})</span>
                    </div>
                    <button class="add-to-cart ${outOfStock ? 'disabled' : ''}" data-id="${product.id}" ${outOfStock ? 'disabled' : ''}>
                        <i class="fas ${outOfStock ? 'fa-times' : 'fa-plus'}"></i>
                    </button>
                </div>
                ${!outOfStock ? `<div class="stock-info">Stock disponible: ${product.stock}</div>` : ''}
            </div>
        `;
        
        // Agregar la tarjeta al contenedor
        productsContainer.appendChild(productCard);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('disabled')) {
                showToast('Producto agotado', 'warning');
                return;
            }
            
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    // Añadir estilos dinámicos
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .out-of-stock-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.5rem;
            text-transform: uppercase;
        }
        
        .stock-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #ff6b6b;
            color: white;
            font-weight: 600;
            font-size: 0.8rem;
            padding: 5px 10px;
            border-radius: 20px;
            z-index: 2;
        }
        
        .stock-badge.low {
            background-color: #ff9f43;
        }
        
        .add-to-cart.disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .stock-info {
            font-size: 0.8rem;
            color: #666;
            margin-top: 5px;
            text-align: right;
        }
    `;
    document.head.appendChild(styleElement);
}

// Función para generar el HTML de las estrellas según la calificación
function getStarsHTML(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    // Agregar estrellas completas
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Agregar media estrella si aplica
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Agregar estrellas vacías
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Función para encontrar un producto por ID
function findProductById(id) {
    return products.find(product => product.id === id);
}

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', displayProducts);