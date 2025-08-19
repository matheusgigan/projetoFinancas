document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams(window.location.search);
    const metaId = params.get('id');

    // Validações
    if (!token || !metaId) {
        window.location.href = 'index.html';
        return;
    }

    // Elementos da página
    const nomeMetaElement = document.getElementById('nome-meta');
    const progressoTextoElement = document.getElementById('progresso-texto');
    const progressBarElement = document.getElementById('progress-bar');
    const valorAtualElement = document.getElementById('valor-atual');
    const valorMetaElement = document.getElementById('valor-meta');
    const formDepositar = document.getElementById('form-depositar');
    const inputDeposito = document.getElementById('valor-deposito');

    const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
    };

    // Função para buscar e atualizar os dados da meta na tela
    const atualizarDadosMeta = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/metas-pessoais/${metaId}/`, { headers });
            if (!response.ok) throw new Error('Falha ao buscar meta.');
            const meta = await response.json();

            nomeMetaElement.textContent = meta.nome;
            valorAtualElement.textContent = `R$ ${parseFloat(meta.valor_atual).toFixed(2)}`;
            valorMetaElement.textContent = `R$ ${parseFloat(meta.valor_meta).toFixed(2)}`;

            const progresso = (meta.valor_atual / meta.valor_meta) * 100;
            progressoTextoElement.textContent = `${progresso.toFixed(1)}%`;
            progressBarElement.style.width = `${progresso}%`;

        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível carregar os detalhes da meta.');
        }
    };

    // Lógica do formulário de depósito
    formDepositar.addEventListener('submit', async (event) => {
        event.preventDefault();
        const valor = inputDeposito.value;
        if (!valor || valor <= 0) {
            alert('Por favor, insira um valor positivo.');
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
            atualizarDadosMeta(); // ATUALIZA A TELA com o novo progresso!

        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível registrar o depósito.');
        }
    });

    // Chamada inicial para carregar os dados da meta
    atualizarDadosMeta();
});