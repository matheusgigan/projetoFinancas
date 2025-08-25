// frontend_web/grupo_detalhe.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams(window.location.search);
    const grupoId = params.get('id');

    if (!token || !grupoId) {
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

    // --- Seletores de Elementos da Página ---
    const nomeGrupoElement = document.getElementById('nome-grupo');
    const listaMembrosElement = document.getElementById('lista-membros');
    const formConvidarMembro = document.getElementById('form-convidar-membro');
    const inputUsernameConvite = document.getElementById('username-convite');
    const listaMetasGrupoElement = document.getElementById('lista-metas-grupo');
    const formCriarMetaGrupo = document.getElementById('form-criar-meta-grupo');

    // --- FUNÇÃO PRINCIPAL PARA CARREGAR TUDO DA PÁGINA ---
    const carregarDetalhes = async () => {
        try {
            // Busca os detalhes do grupo e suas metas em paralelo
            const [grupo, metas] = await Promise.all([
                fetch(`https://app-financas-matheus.onrender.com/api/grupos/${grupoId}/`, { headers }).then(res => res.json()),
                fetch(`https://app-financas-matheus.onrender.com/api/grupos/${grupoId}/metas/`, { headers }).then(res => res.json())
            ]);

            // Renderiza as informações na tela
            renderizarNomeGrupo(grupo);
            renderizarMembros(grupo);
            renderizarMetas(metas);

        } catch (error) {
            console.error("Erro ao carregar detalhes do grupo:", error);
            showErrorToast("Não foi possível carregar os dados do grupo.");
        }
    };

    // --- Funções de Renderização ---
    const renderizarNomeGrupo = (grupo) => {
        nomeGrupoElement.textContent = `Grupo: ${grupo.nome_grupo}`;
    };

    const renderizarMembros = (grupo) => {
        listaMembrosElement.innerHTML = '';
        grupo.membros.forEach(membro => {
            const item = document.createElement('li');
            item.textContent = membro;
            if (membro === grupo.criador) {
                const tagCriador = document.createElement('span');
                tagCriador.className = 'criador-tag';
                tagCriador.textContent = '(Criador)';
                item.appendChild(tagCriador);
            }
            listaMembrosElement.appendChild(item);
        });
        formConvidarMembro.style.display = 'flex';
    };

    const renderizarMetas = (metas) => {
        listaMetasGrupoElement.innerHTML = '';
        if (metas.length === 0) {
            listaMetasGrupoElement.innerHTML = '<p>Nenhuma meta criada para este grupo.</p>';
        } else {
            metas.forEach(meta => {
                const progresso = (parseFloat(meta.valor_atual) / parseFloat(meta.valor_meta)) * 100;
                const link = document.createElement('a');
                link.className = 'meta-card-link';
                // O link agora passa os dois IDs necessários para a nova página
                link.href = `meta_grupo_detalhe.html?grupoId=${grupoId}&metaId=${meta.id}`;
                
                link.innerHTML = `
                    <div class="card">
                        <h3>${meta.nome}</h3>
                        <p>Progresso: <b>${progresso.toFixed(1)}%</b></p>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progresso > 100 ? 100 : progresso}%;"></div>
                        </div>
                        <p>R$ ${parseFloat(meta.valor_atual).toFixed(2)} / R$ ${parseFloat(meta.valor_meta).toFixed(2)}</p>
                    </div>
                `;
                listaMetasGrupoElement.appendChild(link);
            });
        }
    };
    // --- Lógica dos Formulários ---

    // Criar nova meta de grupo
    formCriarMetaGrupo.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('nome-meta-grupo').value;
        const valor = document.getElementById('valor-meta-grupo').value;
        try {
            const response = await fetch(`https://app-financas-matheus.onrender.com/api/grupos/${grupoId}/metas/`, { method: 'POST', headers, body: JSON.stringify({ nome: nome, valor_meta: valor }) });
            if (!response.ok) throw new Error('Falha ao criar a meta.');
            showSuccessToast("Meta de grupo criada!");
            formCriarMetaGrupo.reset();
            carregarDetalhes();
        } catch (error) { showErrorToast('Erro ao criar meta.'); }
    });

    // Adicionar contribuição a uma meta (usando delegação de evento)
    listaMetasGrupoElement.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('form-contribuir')) {
            event.preventDefault();
            const form = event.target;
            const metaId = form.dataset.metaId;
            const valor = form.querySelector('.input-valor-contribuicao').value;
            if (!valor || valor <= 0) {
                showErrorToast("Por favor, insira um valor positivo.");
                return;
            }
            try {
                const response = await fetch(`https://app-financas-matheus.onrender.com/api/grupos/${grupoId}/metas/${metaId}/contribuicoes/`, { method: 'POST', headers, body: JSON.stringify({ valor: valor }) });
                if (!response.ok) throw new Error('Falha ao registrar contribuição.');
                showSuccessToast("Contribuição registrada!");
                carregarDetalhes();
            } catch (error) { showErrorToast('Erro ao registrar contribuição.'); }
        }
    });

    // Convidar novo membro
    formConvidarMembro.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = inputUsernameConvite.value;
        if (!username) return;
        try {
            const response = await fetch(`https://app-financas-matheus.onrender.com/api/grupos/${grupoId}/convidar/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ username: username })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.erro || 'Não foi possível convidar o usuário.'); }
            showSuccessToast(data.sucesso);
            inputUsernameConvite.value = '';
            carregarDetalhes();
        } catch (error) { showErrorToast(error.message); }
    });

    // --- Chamada Inicial ---
    carregarDetalhes();
});