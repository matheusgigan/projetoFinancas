// frontend_web/script.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    // Funções de notificação (Toastify)
    const showSuccessToast = (message) => {
        Toastify({
            text: message, duration: 2000, gravity: "top", position: "right",
            style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
        }).showToast();
    };
    const showErrorToast = (message) => {
        Toastify({
            text: message, duration: 3000, gravity: "top", position: "right",
            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
        }).showToast();
    };

    if (loginForm) {
        const token = localStorage.getItem('authToken');
        if (token) {
            window.location.href = 'home.html';
            return;
        }
        
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Previne o recarregamento da página
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch('https://app-financas-matheus.onrender.com/api/auth/login/', {
                    method: 'POST',
                    body: new URLSearchParams({ 'username': username, 'password': password })
                });
                const data = await response.json();
                if (!response.ok) { throw new Error(data.non_field_errors || 'Erro desconhecido.'); }
                
                showSuccessToast("Login bem-sucedido! Redirecionando...");
                localStorage.setItem('authToken', data.token);
                
                // Pausa de 2 segundos antes de redirecionar
                setTimeout(() => { window.location.href = 'home.html'; }, 2000);

            } catch (error) {
                console.error("Erro no login:", error);
                showErrorToast(`Falha no login: ${error.message}`);
            }
        });
    }
});