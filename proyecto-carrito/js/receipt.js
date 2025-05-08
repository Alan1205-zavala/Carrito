// Generación de recibos
let currentReceiptData = null;

// DOM Elements
const receiptModal = document.getElementById('receipt-modal');
const closeReceiptBtn = document.getElementById('close-receipt');
const closeReceiptFooterBtn = document.getElementById('close-receipt-btn');
const downloadReceiptBtn = document.getElementById('download-receipt');
const receiptContent = document.getElementById('receipt-content');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    closeReceiptBtn.addEventListener('click', hideReceiptModal);
    closeReceiptFooterBtn.addEventListener('click', hideReceiptModal);
    downloadReceiptBtn.addEventListener('click', downloadReceipt);
    
    // Cerrar modal al hacer click fuera
    receiptModal.addEventListener('click', function(e) {
        if (e.target === receiptModal) {
            hideReceiptModal();
        }
    });
});

// Mostrar modal de recibo
function showReceiptModal() {
    receiptModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

// Ocultar modal de recibo
function hideReceiptModal() {
    receiptModal.classList.remove('show');
    document.body.style.overflow = ''; // Restaurar scroll
}

// Generar recibo HTML
function generateReceipt(orderData) {
    // Generar datos del recibo
    currentReceiptData = generateReceiptData(orderData);
    
    // Verificar si es un pago simulado
    const isSimulated = orderData.id.includes('SIMULATED');
    const receiptType = isSimulated ? '(Simulación - No es un cargo real)' : '(Sandbox - Entorno de pruebas)';
    
    // Crear HTML del recibo
    const receiptHTML = `
        <div class="receipt" id="receipt-for-pdf">
            <div class="receipt-header">
                <div class="receipt-logo">Tech<span>Shop</span></div>
                <p>Recibo de Compra</p>
                <p style="color: #ff6b6b; font-size: 0.8rem; margin-top: 5px;">${receiptType}</p>
            </div>
            
            <div class="receipt-info">
                <div class="receipt-info-item">
                    <strong>Recibo #:</strong>
                    <span>${currentReceiptData.receiptNumber}</span>
                </div>
                <div class="receipt-info-item">
                    <strong>Fecha:</strong>
                    <span>${currentReceiptData.date}</span>
                </div>
                <div class="receipt-info-item">
                    <strong>Hora:</strong>
                    <span>${currentReceiptData.time}</span>
                </div>
                <div class="receipt-info-item">
                    <strong>Método de Pago:</strong>
                    <span>${currentReceiptData.paymentMethod}</span>
                </div>
                <div class="receipt-info-item">
                    <strong>ID de Transacción:</strong>
                    <span>${currentReceiptData.transactionId}</span>
                </div>
                <div class="receipt-info-item">
                    <strong>Cliente:</strong>
                    <span>${currentReceiptData.customerName}</span>
                </div>
                <div class="receipt-info-item">
                    <strong>Email:</strong>
                    <span>${currentReceiptData.customerEmail}</span>
                </div>
            </div>
            
            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${currentReceiptData.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>${item.quantity}</td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">Subtotal</td>
                        <td>$${currentReceiptData.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3">IVA (16%)</td>
                        <td>$${currentReceiptData.tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3"><strong>Total</strong></td>
                        <td><strong>$${currentReceiptData.total.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="receipt-footer">
                <p>¡Gracias por tu compra!</p>
                <p>TechShop - La mejor tienda de tecnología</p>
                <p style="color: #777; font-style: italic;">Este es un recibo generado en un entorno de pruebas</p>
                <p style="color: #777; font-style: italic;">No se ha realizado ningún cargo real</p>
            </div>
        </div>
    `;
    
    // Mostrar el recibo en el modal
    receiptContent.innerHTML = receiptHTML;
}

// Descargar recibo como PDF
function downloadReceipt() {
    // Verificar si hay datos de recibo
    if (!currentReceiptData) {
        showToast('No hay recibo para descargar', 'error');
        return;
    }
    
    // Configuración para html2pdf
    const element = document.getElementById('receipt-for-pdf');
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `recibo-${currentReceiptData.receiptNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generar PDF
    showToast('Generando PDF, por favor espera...', 'success');
    
    // Usar setTimeout para permitir que se muestre el toast
    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            showToast('PDF descargado correctamente', 'success');
        }).catch(err => {
            console.error('Error al generar PDF:', err);
            showToast('Error al generar el PDF', 'error');
        });
    }, 500);
}