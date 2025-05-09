// Sistema de pagos ficticio para TechShop

// Clase para manejar pagos
class PaymentSystem {
    constructor() {
        // Tipos de tarjetas aceptadas
        this.cardTypes = [
            { type: 'visa', pattern: /^4/, length: [16], cvvLength: 3 },
            { type: 'mastercard', pattern: /^(5[1-5]|2[2-7])/, length: [16], cvvLength: 3 },
            { type: 'amex', pattern: /^3[47]/, length: [15], cvvLength: 4 },
            { type: 'discover', pattern: /^(6011|65|64[4-9])/, length: [16], cvvLength: 3 }
        ];
        
        // Tarjetas de prueba
        this.testCards = [
            { number: '4111111111111111', type: 'visa', expiry: '12/25', cvv: '123', name: 'VISA TEST CARD' },
            { number: '5555555555554444', type: 'mastercard', expiry: '12/25', cvv: '123', name: 'MASTERCARD TEST' },
            { number: '371449635398431', type: 'amex', expiry: '12/25', cvv: '1234', name: 'AMEX TEST CARD' },
            { number: '6011111111111117', type: 'discover', expiry: '12/25', cvv: '123', name: 'DISCOVER TEST' }
        ];
    }
    
    // Detectar tipo de tarjeta según número
    detectCardType(number) {
        const cleanNumber = number.replace(/\D/g, '');
        
        for (const card of this.cardTypes) {
            if (card.pattern.test(cleanNumber)) {
                return card.type;
            }
        }
        
        return null;
    }
    
    // Validar número de tarjeta (algoritmo de Luhn)
    validateCardNumber(number) {
        const cleanNumber = number.replace(/\D/g, '');
        
        // Verificar longitud
        const cardType = this.detectCardType(cleanNumber);
        if (!cardType) return false;
        
        const validLengths = this.cardTypes.find(c => c.type === cardType).length;
        if (!validLengths.includes(cleanNumber.length)) return false;
        
        // Implementación del algoritmo de Luhn
        let sum = 0;
        let shouldDouble = false;
        
        // Recorrer de derecha a izquierda
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i));
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return (sum % 10) === 0;
    }
    
    // Validar fecha de expiración
    validateExpiry(expiry) {
        const pattern = /^(0[1-9]|1[0-2])\/(\d{2})$/;
        if (!pattern.test(expiry)) return false;
        
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expiryMonth = parseInt(month, 10);
        const expiryYear = parseInt(year, 10);
        
        if (expiryYear < currentYear) return false;
        if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
        
        return true;
    }
    
    // Validar CVV
    validateCvv(cvv, cardType) {
        if (!cardType) return false;
        
        const requiredLength = this.cardTypes.find(c => c.type === cardType).cvvLength;
        const cleanCvv = cvv.replace(/\D/g, '');
        
        return cleanCvv.length === requiredLength;
    }
    
    // Procesar pago
    processPayment(paymentData) {
        return new Promise((resolve, reject) => {
            // Simular tiempo de procesamiento
            setTimeout(() => {
                try {
                    // Validar datos de tarjeta
                    const cardNumber = paymentData.cardNumber.replace(/\D/g, '');
                    const cardType = this.detectCardType(cardNumber);
                    
                    if (!cardType) {
                        reject({ error: 'card_invalid', message: 'Número de tarjeta inválido' });
                        return;
                    }
                    
                    if (!this.validateCardNumber(cardNumber)) {
                        reject({ error: 'card_invalid', message: 'Número de tarjeta inválido' });
                        return;
                    }
                    
                    if (!this.validateExpiry(paymentData.expiry)) {
                        reject({ error: 'expiry_invalid', message: 'Fecha de expiración inválida' });
                        return;
                    }
                    
                    if (!this.validateCvv(paymentData.cvv, cardType)) {
                        reject({ error: 'cvv_invalid', message: 'Código de seguridad inválido' });
                        return;
                    }
                    
                    // Para la demostración, simular algunas tarjetas rechazadas
                    if (cardNumber === '4000000000000002') {
                        reject({ error: 'card_declined', message: 'Tarjeta rechazada' });
                        return;
                    }
                    
                    if (cardNumber === '4000000000000069') {
                        reject({ error: 'expired_card', message: 'Tarjeta expirada' });
                        return;
                    }
                    
                    if (cardNumber === '4000000000000119') {
                        reject({ error: 'processing_error', message: 'Error de procesamiento' });
                        return;
                    }
                    
                    // Generar ID de transacción
                    const transactionId = 'TR' + Date.now().toString().substring(3) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                    
                    // Pago exitoso
                    resolve({
                        success: true,
                        transactionId: transactionId,
                        cardType: cardType,
                        last4: cardNumber.slice(-4),
                        amount: paymentData.amount,
                        currency: paymentData.currency || 'MXN',
                        date: new Date().toISOString()
                    });
                } catch (error) {
                    reject({ error: 'unknown_error', message: 'Error desconocido al procesar el pago' });
                }
            }, 1500); // Simular 1.5 segundos de procesamiento
        });
    }
    
    // Formatear número de tarjeta mientras se escribe (4 dígitos por grupo)
    formatCardNumber(input) {
        let value = input.replace(/\D/g, '');
        let formattedValue = '';
        
        // Detectar tipo de tarjeta
        const cardType = this.detectCardType(value);
        
        // Determinar patrón de formato según tipo de tarjeta
        if (cardType === 'amex') {
            // AMEX: XXXX XXXXXX XXXXX
            for (let i = 0; i < value.length; i++) {
                if (i === 4 || i === 10) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
        } else {
            // Otros: XXXX XXXX XXXX XXXX
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
        }
        
        return { formattedValue, cardType };
    }
    
    // Formatear fecha de expiración mientras se escribe (MM/YY)
    formatExpiry(input) {
        let value = input.replace(/\D/g, '');
        
        if (value.length > 0) {
            // Ajustar primer dígito si es mayor a 1
            if (value[0] > 1) {
                value = '0' + value[0];
            }
            
            // Ajustar segundo dígito si el primero es 1 y el segundo es mayor a 2
            if (value.length > 1 && value[0] === '1' && value[1] > 2) {
                value = '12';
            }
            
            // Formatear como MM/YY
            if (value.length > 2) {
                return value.slice(0, 2) + '/' + value.slice(2, 4);
            } else {
                return value;
            }
        }
        
        return value;
    }
    
    // Obtener una tarjeta de prueba aleatoria
    getRandomTestCard() {
        const randomIndex = Math.floor(Math.random() * this.testCards.length);
        return { ...this.testCards[randomIndex] };
    }
}

// Crear instancia global
const paymentSystem = new PaymentSystem();

// Exportar para usar en otros archivos
window.paymentSystem = paymentSystem;