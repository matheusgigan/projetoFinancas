// frontend_web/metas.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'index.html'; return; }
    const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };

    const showSuccessToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
    const showErrorToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();

    // --- Seletores ---
    const listaMetasElement = document.getElementById('lista-metas');
    const formCriarMeta = document.getElementById('form-criar-meta');
    const editMetaModal = document.getElementById('edit-meta-modal');
    const editMetaForm = document.getElementById('form-editar-meta');
    const cancelEditMetaBtn = document.getElementById('cancel-edit-meta-btn');

    // --- Função Principal para Carregar as Metas ---
    const carregarMetas = async () => {
        try {
            const response = await fetch('https://app-financas-matheus.onrender.com/api/metas-pessoais/', { headers: { 'Authorization': `Token ${token}` } });
            const metas = await response.json();

            listaMetasElement.innerHTML = '';
            if (metas.length === 0) {
                listaMetasElement.innerHTML = '<li>Nenhuma meta criada.</li>';
            } else {
                metas.forEach(meta => {
                    const progresso = (parseFloat(meta.valor_atual) / parseFloat(meta.valor_meta)) * 100;
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.textContent = `${meta.nome} (Progresso: ${progresso.toFixed(1)}%)`;
                    link.href = `meta_detalhe.html?id=${meta.id}`;
                    const actionsContainer = document.createElement('div');
                    actionsContainer.className = 'actions-container';
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Editar';
                    editBtn.className = 'edit-btn edit-meta-btn';
                    editBtn.dataset.id = meta.id;
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'X';
                    deleteBtn.className = 'delete-btn delete-meta-btn';
                    deleteBtn.dataset.id = meta.id;
                    actionsContainer.appendChild(editBtn);
                    actionsContainer.appendChild(deleteBtn);
                    item.appendChild(link);
                    item.appendChild(actionsContainer);
                    listaMetasElement.appendChild(item);
                });
            }
        } catch (error) {
            showErrorToast("Não foi possível carregar as metas.");
        }
    };

    // --- Lógica dos Formulários e Botões ---
    if (formCriarMeta) {
        const inputNomeNovaMeta = document.getElementById('nome-nova-meta');
        const inputValorNovaMeta = document.getElementById('valor-nova-meta');

        // Ouvinte de evento para o envio do formulário
        formCriarMeta.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const nome = inputNomeNovaMeta.value;
            const valor_meta = inputValorNovaMeta.value;

            // Validação simples
            if (!nome || !valor_meta || parseFloat(valor_meta) <= 0) {
                showErrorToast('Por favor, preencha todos os campos com valores válidos.');
                return;
            }

            // Envio para a API
            try {
                const response = await fetch('https://app-financas-matheus.onrender.com/api/metas-pessoais/', {
                    method: 'POST',
                    headers: headers, // 'headers' deve estar definido no escopo superior
                    body: JSON.stringify({ 
                        nome: nome,
                        valor_meta: valor_meta 
                    })
                });
                if (!response.ok) throw new Error('Falha ao criar a meta.');
                
                showSuccessToast("Nova meta criada com sucesso!");
                formCriarMeta.reset(); // Limpa os campos do formulário
                carregarMetas(); // Recarrega a lista de metas na tela

            } catch (error) {
                console.error('Erro ao criar meta:', error);
                showErrorToast('Ocorreu um erro ao tentar criar a meta.');
            }
        });
    }

    if (listaMetasElement) {
        listaMetasElement.addEventListener('click', async (event) => {
            const target = event.target;
            const metaId = target.dataset.id;
            
            if (target.classList.contains('edit-meta-btn')) {
                event.preventDefault();
                try {
                    const response = await fetch(`https://app-financas-matheus.onrender.com/api/metas-pessoais/${metaId}/`, { headers: { 'Authorization': `Token ${token}` } });
                    if (!response.ok) throw new Error('Falha ao buscar dados da meta.');
                    const meta = await response.json();
                    editMetaId.value = meta.id;
                    editNomeMeta.value = meta.nome;
                    editValorMeta.value = meta.valor_meta;
                    editMetaModal.style.display = 'flex';
                } catch (error) { showErrorToast(error.message); }
            }

            if (target.classList.contains('delete-meta-btn')) {
                event.preventDefault();
                if (!confirm('Tem certeza que deseja deletar esta meta de poupança?')) return;
                try {
                    const response = await fetch(`https://app-financas-matheus.onrender.com/api/metas-pessoais/${metaId}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
                    if (response.status !== 204) throw new Error('Falha ao deletar a meta.');
                    showSuccessToast("Meta deletada com sucesso.");
                    carregarDashboard();
                } catch (error) { showErrorToast('Não foi possível deletar a meta.'); }
            }
        });
    }

    if (editMetaForm) {
        editMetaForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const metaId = editMetaId.value;
            const dados = { nome: editNomeMeta.value, valor_meta: editValorMeta.value };
            try {
                const response = await fetch(`https://app-financas-matheus.onrender.com/api/metas-pessoais/${metaId}/`, { method: 'PATCH', headers, body: JSON.stringify(dados) });
                if (!response.ok) throw new Error('Não foi possível salvar as alterações.');
                editMetaModal.style.display = 'none';
                showSuccessToast("Meta atualizada com sucesso!");
                carregarDashboard();
            } catch (error) { showErrorToast(error.message); }
        });
    }

    if (cancelEditMetaBtn) { cancelEditMetaBtn.addEventListener('click', () => { editMetaModal.style.display = 'none'; }); }

    carregarMetas();
});