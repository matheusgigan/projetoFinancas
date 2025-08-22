// frontend_web/register.js (VERSÃO FINAL E CORRIGIDA)

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    
    // Funções de notificação (Toastify)
    const showSuccessToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
    const showErrorToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            // 1. A primeira e mais importante linha: impede o recarregamento.
            event.preventDefault(); 
            
            // DEBUG: Confirma que o clique foi capturado.
            console.log("Formulário enviado! A ação de recarregar foi prevenida.");

            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const password2 = document.getElementById('register-password2').value;

            if (password !== password2) {
                showErrorToast("As senhas não coincidem.");
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                if (!response.ok) {
                    const errorMessage = Object.values(data).flat().join(' ');
                    throw new Error(errorMessage || 'Não foi possível completar o cadastro.');
                }
                
                showSuccessToast("Cadastro realizado! Redirecionando para o login...");
                setTimeout(() => { window.location.href = 'index.html'; }, 3000);

            } catch (error) {
                console.error("Erro no cadastro:", error);
                showErrorToast(`Erro: ${error.message}`);
            }
        });
    } else {
        console.error("ERRO CRÍTICO: Formulário de cadastro não encontrado na página.");
    }
});