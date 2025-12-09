document.addEventListener("DOMContentLoaded", () => {
    
    const API_URL = "http://23.23.138.3:4000/api"; 

    
    const loginForm = document.querySelector('form[action="/login"]');
    
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 

            
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", 
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    
                    window.location.href = "/welcome";
                } else {
                    
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error(error);
                alert("Error conectando con el servidor");
            }
        });
    }

    // ===== REGISTRO =====
    const registerForm = document.querySelector('form[action="/register"]');

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("¡Registro exitoso! Ahora inicia sesión.");
                    window.location.href = "/login";
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error(error);
                alert("Error conectando con el servidor");
            }
        });
    }

    
    const confirmLogoutBtn = document.querySelector('a[href="/logoutConfirm"]');

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener("click", async (e) => {
            e.preventDefault(); 
            
            try {
                
                await fetch(`${API_URL}/logout`, { 
                    method: "POST", 
                    credentials: "include" 
                });

                
                window.location.href = "/logoutConfirm"; 
                
            } catch (err) {
                console.error("Error al cerrar sesión en backend", err);
                
                window.location.href = "/logoutConfirm";
            }
        });
    }
});