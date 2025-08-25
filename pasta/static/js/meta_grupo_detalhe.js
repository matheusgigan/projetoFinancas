// frontend_web/meta_grupo_detalhe.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams(window.location.search);
    const grupoId = params.get('grupoId');
    const metaId = params.get('metaId');

    if (!token || !grupoId || !metaId) {
        window.location.href = 'index.html';
        return;
    }
    const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };
    
    // Funções de notificação
    const showSuccessToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
    const showErrorToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();

    // --- Seletores dos elementos da página ---
    const nomeMetaElement = document.getElementById('nome-meta-grupo');
    const progressoTextoElement = document.getElementById('progresso-texto');
    const progressBarElement = document.getElementById('progress-bar');
    const valorAtualElement = document.getElementById('valor-atual');
    const valorMetaElement = document.getElementById('valor-meta');
    const listaContribuicoesElement = document.getElementById('lista-contribuicoes');
    const formContribuir = document.getElementById('form-contribuir');
    const inputContribuicao = document.getElementById('input-valor-contribuicao');
    
    // Corrige o link de "Voltar"
    const linkVoltar = document.getElementById('link-voltar-grupo');
    if (linkVoltar) {
        linkVoltar.href = `grupo_detalhe.html?id=${grupoId}`;
    }

    // --- Função para buscar e atualizar os dados da meta na tela ---
    const carregarDetalhesMeta = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/metas/${metaId}/`, { headers });
            if (!response.ok) throw new Error('Falha ao buscar detalhes da meta.');
            const meta = await response.json();
            
            // Renderiza as informações de progresso
            nomeMetaElement.textContent = meta.nome;
            valorAtualElement.textContent = `R$ ${parseFloat(meta.valor_atual).toFixed(2)}`;
            valorMetaElement.textContent = `R$ ${parseFloat(meta.valor_meta).toFixed(2)}`;
            let progresso = (parseFloat(meta.valor_atual) / parseFloat(meta.valor_meta)) * 100;
            if (progresso > 100) progresso = 100;
            progressoTextoElement.textContent = `${progresso.toFixed(1)}%`;
            progressBarElement.style.width = `${progresso}%`;
            
            // Renderiza a lista de contribuições
            listaContribuicoesElement.innerHTML = '';
            if (meta.contribuicoes.length === 0) {
                listaContribuicoesElement.innerHTML = '<li>Nenhuma contribuição ainda. Seja o primeiro!</li>';
            } else {
                meta.contribuicoes.forEach(c => {
                    const item = document.createElement('li');
                    // Garante que o espaçamento e o estilo fiquem corretos
                    item.innerHTML = `<span>${c.usuario}</span><strong>R$ ${parseFloat(c.valor_contribuicao).toFixed(2)}</strong>`;
                    listaContribuicoesElement.appendChild(item);
                });
            }
        } catch (error) {
            console.error(error);
            showErrorToast("Não foi possível carregar os dados desta meta.");
        }
    };
    
    // --- Lógica do formulário de contribuição ---
    formContribuir.addEventListener('submit', async (event) => {
        event.preventDefault();
        const valor = inputContribuicao.value;
        if (!valor || valor <= 0) {
            showErrorToast("Por favor, insira um valor positivo.");
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/metas/${metaId}/contribuicoes/`, {
                method: 'POST', headers, body: JSON.stringify({ valor: valor })
            });
            if (!response.ok) throw new Error('Falha ao registrar contribuição.');

            showSuccessToast("Contribuição registrada!"); // <-- A NOTIFICAÇÃO
            inputContribuicao.value = '';
            carregarDetalhesMeta(); // Recarrega os detalhes da página
        } catch (error) { showErrorToast("Erro ao registrar contribuição."); }
    });

    // --- Chamada Inicial ---
    carregarDetalhesMeta();
});