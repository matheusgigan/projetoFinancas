// script.js

// 1. Espera o HTML inteiro ser carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // 2. Identifica os elementos do formulário no HTML.
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.querySelector('input[placeholder="Usuário"]');
    const passwordInput = document.querySelector('input[placeholder="Senha"]');

    // 3. Adiciona um "ouvinte" que espera pelo evento de "submit" do formulário.
    loginForm.addEventListener('submit', async (event) => {
        // Previne o comportamento padrão do formulário, que é recarregar a página.
        event.preventDefault();

        // 4. Pega os valores digitados pelo usuário.
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Mostra no console do navegador que estamos tentando, ótimo para debug.
        console.log(`Tentando fazer login com usuário: ${username}`);

        try {
            // 5. Envia os dados para a API Django usando fetch().
            const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
                method: 'POST',
                // A API de login do Django espera os dados como "form data", não JSON.
                // O URLSearchParams formata os dados corretamente para nós.
                body: new URLSearchParams({
                    'username': username,
                    'password': password
                })
            });

            // Pega a resposta da API e converte para JSON.
            const data = await response.json();

            // 6. Verifica se a resposta foi um sucesso (status 200 a 299).
            if (response.ok) {
                console.log('Login bem-sucedido!', data);
                alert('Login bem-sucedido!');

                // Salva o token no armazenamento local do navegador para uso futuro.
                localStorage.setItem('authToken', data.token);

                // No futuro, aqui você redirecionaria para a tela principal do app.
                window.location.href = 'home.html'; // Redireciona para a tela principal

            } else {
                console.error('Falha no login:', data);
                alert('Usuário ou senha inválidos.');
            }

        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
    });
});