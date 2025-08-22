// frontend_web/meta_detalhe.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams(window.location.search);
    const metaId = params.get('id');

    if (!token || !metaId) {
        window.location.href = 'index.html';
        return;
    }

    const headers = { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Funções auxiliares para notificações (Toastify)
    const showSuccessToast = (message) => {
        Toastify({
            text: message, duration: 3000, gravity: "top", position: "right",
            style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
        }).showToast();
    };
    const showErrorToast = (message) => {
        Toastify({
            text: message, duration: 3000, gravity: "top", position: "right",
            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
        }).showToast();
    };

    // --- Seletores de elementos desta página ---
    const nomeMetaElement = document.getElementById('nome-meta');
    const progressoTextoElement = document.getElementById('progresso-texto');
    const progressBarElement = document.getElementById('progress-bar');
    const valorAtualElement = document.getElementById('valor-atual');
    const valorMetaElement = document.getElementById('valor-meta');
    const formDepositar = document.getElementById('form-depositar');
    const inputDeposito = document.getElementById('valor-deposito');

    // --- Função para buscar e atualizar os dados da meta na tela ---
    const atualizarDadosMeta = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/metas-pessoais/${metaId}/`, { headers });
            if (!response.ok) throw new Error('Falha ao buscar meta.');
            const meta = await response.json();

            nomeMetaElement.textContent = meta.nome;
            valorAtualElement.textContent = `R$ ${parseFloat(meta.valor_atual).toFixed(2)}`;
            valorMetaElement.textContent = `R$ ${parseFloat(meta.valor_meta).toFixed(2)}`;
            
            let progresso = (parseFloat(meta.valor_atual) / parseFloat(meta.valor_meta)) * 100;
            // Garante que o progresso não passe de 100%
            if (progresso > 100) {
                progresso = 100;
            }
            
            progressoTextoElement.textContent = `${progresso.toFixed(1)}%`;
            progressBarElement.style.width = `${progresso}%`;

        } catch (error) {
            console.error('Erro:', error);
            showErrorToast('Não foi possível carregar os detalhes da meta.');
        }
    };

    // --- Lógica do formulário de depósito ---
    formDepositar.addEventListener('submit', async (event) => {
        event.preventDefault();
        const valor = inputDeposito.value;
        if (!valor || valor <= 0) {
            showErrorToast('Por favor, insira um valor positivo.');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/metas-pessoais/${metaId}/depositar/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ valor: valor })
            });

            if (!response.ok) throw new Error('Falha ao registrar depósito.');
            
            inputDeposito.value = ''; // Limpa o campo
            showSuccessToast("Depósito registrado com sucesso!");
            atualizarDadosMeta(); // ATUALIZA A TELA com o novo progresso!

        } catch (error) {
            console.error('Erro:', error);
            showErrorToast('Não foi possível registrar o depósito.');
        }
    });

    // --- Chamada inicial para carregar os dados da meta ---
    atualizarDadosMeta();
});