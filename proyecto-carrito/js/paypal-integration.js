// PayPal Integration
let paypalButtonRendered = false;

// Configurar PayPal al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadPayPalScript();
});

// Función para cargar el script de PayPal de forma dinámica
function loadPayPalScript() {
    // Remover script anterior si existe
    const existingScript = document.getElementById('paypal-script');
    if (existingScript) {
        existingScript.remove();
    }
    
    // Crear nuevo script
    const script = document.createElement('script');
    script.id = 'paypal-script';
    script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=MXN&locale=es_MX';
    script.async = true;
    
    // Cuando el script se carga, inicializar los botones
    script.onload = () => {
        initPayPalButton();
    };
    
    // Agregar script al DOM
    document.head.appendChild(script);
}

// Inicializar botón de PayPal
function initPayPalButton() {
    // Limpiar container
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    paypalButtonContainer.innerHTML = '';
    
    // Si el carrito está vacío, no renderizar el botón
    if (cart.length === 0) {
        paypalButtonRendered = false;
        return;
    }
    
    // Contenedor para botones adicionales
    const additionalButtonsContainer = document.createElement('div');
    additionalButtonsContainer.style.marginBottom = '15px';
    paypalButtonContainer.appendChild(additionalButtonsContainer);
    
    // Añadir botón de depuración
    const debugButton = document.createElement('button');
    debugButton.className = 'btn btn-secondary';
    debugButton.style.marginRight = '10px';
    debugButton.textContent = 'Ver datos del carrito';
    debugButton.addEventListener('click', function() {
        debugCart();
    });
    additionalButtonsContainer.appendChild(debugButton);
    
    // Añadir botón de simulación
    const simulateButton = document.createElement('button');
    simulateButton.className = 'btn';
    simulateButton.style.backgroundColor = '#ff9f43';
    simulateButton.textContent = 'Simular pago exitoso';
    simulateButton.addEventListener('click', function() {
        simulateSuccessfulPayment();
    });
    additionalButtonsContainer.appendChild(simulateButton);
    
    // Calcular total para PayPal
    const subtotal = cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Renderizar botón de PayPal
    paypal.Buttons({
        style: {
            color: 'blue',
            shape: 'pill',
            label: 'pay',
            height: 40
        },
        
        createOrder: function(data, actions) {
            // Calcular exactamente la suma de los items para enviar a PayPal
            // Necesitamos asegurarnos que sea exactamente igual a la suma de los precios individuales
            const paypalItems = cart.map(item => {
                // Convertir a números y usar toFixed(2) para asegurar 2 decimales exactos
                const price = parseFloat(item.price).toFixed(2);
                const quantity = parseInt(item.quantity);
                return {
                    name: item.name,
                    unit_amount: { 
                        currency_code: 'MXN', 
                        value: price
                    },
                    quantity: quantity
                };
            });
            
            // Calcular el total exacto sumando cada item individualmente
            let calculatedItemTotal = 0;
            paypalItems.forEach(item => {
                // Multiplicar precio por cantidad
                const itemPrice = parseFloat(item.unit_amount.value);
                const itemQuantity = parseInt(item.quantity);
                const itemTotal = itemPrice * itemQuantity;
                calculatedItemTotal += itemTotal;
            });
            
            // Convertir a string con 2 decimales exactos
            const itemTotalString = calculatedItemTotal.toFixed(2);
            
            // Calcular impuestos basados en el total exacto
            const taxValue = (parseFloat(itemTotalString) * taxRate).toFixed(2);
            
            // Calcular total final
            const totalValue = (parseFloat(itemTotalString) + parseFloat(taxValue)).toFixed(2);
            
            // Mostrar valores en consola para depuración
            console.log('Items para PayPal:', paypalItems);
            console.log('Total calculado manualmente:', itemTotalString);
            
            // Crear la orden en PayPal
            return actions.order.create({
                purchase_units: [{
                    description: 'Compra en TechShop (SANDBOX - PRUEBA)',
                    amount: {
                        currency_code: 'MXN',
                        value: totalValue,
                        breakdown: {
                            item_total: { 
                                currency_code: 'MXN', 
                                value: itemTotalString 
                            },
                            tax_total: { 
                                currency_code: 'MXN', 
                                value: taxValue
                            }
                        }
                    },
                    items: paypalItems
                }],
                application_context: {
                    shipping_preference: 'NO_SHIPPING',
                    brand_name: 'TechShop PRUEBA',
                    locale: 'es-MX',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    payment_method: {
                        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
                    }
                }
            });
        },
        
        onApprove: function(data, actions) {
            // Capturar el pago cuando es aprobado
            return actions.order.capture().then(function(orderData) {
                // Successful capture
                console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                
                // Obtener detalles de la transacción
                const transaction = orderData.purchase_units[0].payments.captures[0];
                
                // Mostrar mensaje de éxito
                showToast(`Pago completado correctamente con ID: ${transaction.id}`, 'success');
                
                // Generar recibo
                generateReceipt(orderData);
                
                // Vaciar carrito
                clearCart();
                
                // Ocultar carrito
                hideCart();
                
                // Mostrar modal de recibo
                showReceiptModal();
            });
        },
        
        onError: function(err) {
            console.error('Error en el pago:', err);
            showToast('Error al procesar el pago: ' + err.message, 'error');
        }
        
    }).render('#paypal-button-container');
    
    paypalButtonRendered = true;
}

// Función para depurar el carrito
function debugCart() {
    console.log('Estado del carrito:', cart);
    
    // Recrear exactamente el cálculo que se enviará a PayPal
    const paypalItems = cart.map(item => {
        const price = parseFloat(item.price).toFixed(2);
        const quantity = parseInt(item.quantity);
        return {
            name: item.name,
            price: price,
            quantity: quantity,
            total: (parseFloat(price) * quantity).toFixed(2)
        };
    });
    
    // Calcular el total exacto usando el mismo método que usa la función createOrder
    let calculatedItemTotal = 0;
    paypalItems.forEach(item => {
        calculatedItemTotal += parseFloat(item.price) * parseInt(item.quantity);
    });
    
    // Formatear como PayPal espera los valores
    const itemTotalString = calculatedItemTotal.toFixed(2);
    const taxValue = (parseFloat(itemTotalString) * taxRate).toFixed(2);
    const totalValue = (parseFloat(itemTotalString) + parseFloat(taxValue)).toFixed(2);
    
    // Crear una tabla visual para la consola
    console.table(paypalItems);
    console.log('============ CÁLCULOS PARA PAYPAL ============');
    console.log('Subtotal calculado exacto:', itemTotalString);
    console.log('IVA calculado exacto:', taxValue);
    console.log('Total calculado exacto:', totalValue);
    
    // Verificar la suma manual para compararla con el cálculo
    let manualSum = 0;
    for (const item of paypalItems) {
        console.log(`Producto: ${item.name}, Precio: ${item.price}, Cantidad: ${item.quantity}, Total: ${item.total}`);
        manualSum += parseFloat(item.total);
    }
    console.log('Suma manual de todos los productos:', manualSum.toFixed(2));
    console.log('¿Los valores coinciden?', manualSum.toFixed(2) === itemTotalString ? 'SÍ' : 'NO ⚠️');
    
    // Mostrar alerta con información resumida
    alert(`Información del carrito:
- Número de productos: ${cart.length}
- Subtotal: $${itemTotalString}
- IVA (16%): $${taxValue}
- Total: $${totalValue}

Ver más detalles en la consola para depuración.`);
}

// Actualizar estado del botón de PayPal
function updatePayPalButton() {
    // Si el botón ya está renderizado y el carrito está vacío, o viceversa, inicializar de nuevo
    if ((paypalButtonRendered && cart.length === 0) || (!paypalButtonRendered && cart.length > 0)) {
        initPayPalButton();
    }
}

// Simular un pago exitoso sin usar PayPal
function simulateSuccessfulPayment() {
    // Crear un objeto similar a lo que devolvería PayPal
    const mockOrderData = {
        id: 'SIMULATED-' + Math.floor(Math.random() * 1000000).toString(),
        status: 'COMPLETED',
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString(),
        payer: {
            name: {
                given_name: 'Cliente',
                surname: 'Simulado'
            },
            email_address: 'cliente.simulado@example.com',
            payer_id: 'SIMULATEDPAYER'
        },
        purchase_units: [
            {
                description: 'Compra en TechShop (SIMULACIÓN)',
                reference_id: 'default',
                soft_descriptor: 'TECHSHOP',
                amount: {
                    currency_code: 'MXN',
                    value: '0.00', // Se actualizará
                    breakdown: {
                        item_total: {
                            currency_code: 'MXN',
                            value: '0.00' // Se actualizará
                        },
                        tax_total: {
                            currency_code: 'MXN',
                            value: '0.00' // Se actualizará
                        }
                    }
                },
                payee: {
                    merchant_id: 'SIMULATEDMERCHANT',
                    email_address: 'comercio@example.com'
                },
                payments: {
                    captures: [
                        {
                            id: 'SIMCAPTURE-' + Math.floor(Math.random() * 1000000).toString(),
                            status: 'COMPLETED',
                            amount: {
                                currency_code: 'MXN',
                                value: '0.00' // Se actualizará
                            },
                            final_capture: true,
                            create_time: new Date().toISOString(),
                            update_time: new Date().toISOString()
                        }
                    ]
                }
            }
        ]
    };
    
    // Calcular los totales exactamente como lo hacemos para PayPal
    const paypalItems = cart.map(item => {
        const price = parseFloat(item.price).toFixed(2);
        const quantity = parseInt(item.quantity);
        return {
            name: item.name,
            price: price,
            quantity: quantity
        };
    });
    
    // Calcular el total exacto
    let calculatedItemTotal = 0;
    paypalItems.forEach(item => {
        calculatedItemTotal += parseFloat(item.price) * parseInt(item.quantity);
    });
    
    const itemTotalString = calculatedItemTotal.toFixed(2);
    const taxValue = (parseFloat(itemTotalString) * taxRate).toFixed(2);
    const totalValue = (parseFloat(itemTotalString) + parseFloat(taxValue)).toFixed(2);
    
    // Actualizar los valores en el objeto simulado
    mockOrderData.purchase_units[0].amount.value = totalValue;
    mockOrderData.purchase_units[0].amount.breakdown.item_total.value = itemTotalString;
    mockOrderData.purchase_units[0].amount.breakdown.tax_total.value = taxValue;
    mockOrderData.purchase_units[0].payments.captures[0].amount.value = totalValue;
    
    // Mostrar mensaje de éxito
    showToast(`Pago simulado completado correctamente con ID: ${mockOrderData.id}`, 'success');
    
    // Generar recibo
    generateReceipt(mockOrderData);
    
    // Vaciar carrito
    clearCart();
    
    // Ocultar carrito
    hideCart();
    
    // Mostrar modal de recibo
    showReceiptModal();
}

// Generar datos para el recibo
function generateReceiptData(orderData) {
    // Fecha actual formateada
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    // Información básica del recibo
    const receiptInfo = {
        receiptNumber: 'INV-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        transactionId: orderData.purchase_units[0].payments.captures[0].id,
        date: formattedDate,
        time: formattedTime,
        paymentMethod: orderData.id.includes('SIMULATED') ? 'PayPal (Simulado)' : 'PayPal',
        customerEmail: orderData.payer.email_address || 'cliente@example.com',
        customerName: `${orderData.payer.name.given_name} ${orderData.payer.name.surname}`,
        items: cart.map(item => ({
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            total: parseFloat(item.price) * item.quantity
        })),
        subtotal: parseFloat(orderData.purchase_units[0].amount.breakdown.item_total.value),
        tax: parseFloat(orderData.purchase_units[0].amount.breakdown.tax_total.value),
        total: parseFloat(orderData.purchase_units[0].amount.value)
    };
    
    return receiptInfo;
}