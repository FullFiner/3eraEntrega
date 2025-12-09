document.addEventListener("DOMContentLoaded", async () => {
   
    const API_URL = "http://23.23.138.3:4000/api";

    
    const saldoElements = document.querySelectorAll('#saldo, #saldo-valor, .saldo-actual'); 
    const emailElement = document.getElementById('usuario-email');
    const usernameElement = document.getElementById('usuario-nombre-perfil');

    
    const transaccionesBody = document.getElementById('transacciones-body');

    
    if (saldoElements.length === 0 && !emailElement && !transaccionesBody) return;

    try {
        
        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            credentials: 'include', 
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('No se pudo cargar el perfil');

        const data = await response.json();
        const user = data.user;

        if (user) {
            
            saldoElements.forEach(el => {
                const currentText = el.innerText;
                
                if (currentText.includes('$')) {
                    el.innerText = `$ ${user.saldo}`;
                } else {
                    el.innerText = user.saldo;
                }
                el.classList.remove('loading');
            });

            if (emailElement) emailElement.textContent = user.email;
            if (usernameElement) usernameElement.textContent = user.username;

            
            if (transaccionesBody && user.transacciones) {
                transaccionesBody.innerHTML = ''; 

                
                const ultimas = user.transacciones.slice(0, 5);

                if (ultimas.length === 0) {
                    transaccionesBody.innerHTML = '<tr><td colspan="3" style="text-align:center">No hay transacciones registradas.</td></tr>';
                } else {
                    ultimas.forEach(t => {
                        const tr = document.createElement('tr');
                        
                        
                        const fechaObj = new Date(t.fecha);
                        const fechaStr = fechaObj.toLocaleDateString() + ' ' + fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                        
                        const esPositivo = t.monto >= 0;
                        const signo = esPositivo ? '+' : '';
                        const color = esPositivo ? '#2ecc71' : '#e74c3c'; 

                        tr.innerHTML = `
                            <td>${fechaStr}</td>
                            <td>${t.tipo}</td>
                            <td style="color: ${color}; font-weight: bold;">
                                ${signo}${t.monto}
                            </td>
                        `;
                        transaccionesBody.appendChild(tr);
                    });
                }
            }
        }

    } catch (error) {
        console.error("Error cargando datos:", error);
        
        if(transaccionesBody) {
             transaccionesBody.innerHTML = '<tr><td colspan="3" style="color:red; text-align:center">Error de conexión</td></tr>';
        }
    }
});