document.addEventListener('DOMContentLoaded', () => {

    
    const API_URL = "http://23.23.138.3:4000/api"; 

    const saldoValorElement = document.getElementById('saldo-valor');
    const formDeposito = document.getElementById('form-deposito');
    const formRetiro = document.getElementById('form-retiro');
    const mensajeElement = document.getElementById('mensaje');

    function mostrarMensaje(texto, esError = false) {
        if (mensajeElement) {
            mensajeElement.textContent = texto;
            mensajeElement.style.color = esError ? 'red' : 'green';
        } else {
            console.log(texto);
        }
    }

    if (saldoValorElement) {
        
        let saldo = parseInt(saldoValorElement.innerText.replace('$', '')) || 0; 
        saldoValorElement.innerText = saldo;
    }

    async function handleTransaccion(e, tipo) {
        e.preventDefault();
        
        const form = e.target;
        const input = form.querySelector('input[type="number"]');
        const monto = Number(input.value);
        
        if (monto <= 0) {
            mostrarMensaje(`Ingresa un monto válido para ${tipo.toLowerCase()}.`, true);
            return;
        }
        
        mostrarMensaje(`Procesando ${tipo.toLowerCase()}...`);

        try {
            
            const response = await fetch(`${API_URL}/${tipo.toLowerCase()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({ monto: monto })
            });

            const data = await response.json();

            if (response.ok) { 
                if (saldoValorElement) {
                    saldoValorElement.innerText = data.nuevoSaldo;
                }
                mostrarMensaje(data.message, false);
                input.value = '';
            } else {
                mostrarMensaje(data.message || `Error en el ${tipo.toLowerCase()}.`, true);
            }
        } catch (error) {
            console.error('Error de red/servidor:', error);
            mostrarMensaje('Error de conexión con el servidor. Intenta de nuevo.', true);
        }
    }

    if (formDeposito) {
        formDeposito.addEventListener('submit', (e) => handleTransaccion(e, 'Deposito'));
    }

    if (formRetiro) {
        formRetiro.addEventListener('submit', (e) => handleTransaccion(e, 'Retiro'));
    }

});