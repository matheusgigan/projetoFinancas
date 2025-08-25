// frontend_web/grupos.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'index.html'; return; }
    const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };

    const showSuccessToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
    const showErrorToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();

    // --- Seletores ---
    const listaGruposElement = document.getElementById('lista-grupos');
    const formCriarGrupo = document.getElementById('form-criar-grupo');
    const inputNovoGrupo = document.getElementById('nome-novo-grupo');

    // --- Função Principal para Carregar os Grupos ---
    const carregarGrupos = async () => {
        try {
            const response = await fetch('https://app-financas-matheus.onrender.com/api/grupos/', { headers: { 'Authorization': `Token ${token}` } });
            const grupos = await response.json();

            listaGruposElement.innerHTML = '';
            if (grupos.length === 0) {
                listaGruposElement.innerHTML = '<li>Você ainda não participa de nenhum grupo.</li>';
            } else {
                grupos.forEach(grupo => {
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.textContent = `${grupo.nome_grupo} (Criado por: ${grupo.criador})`;
                    link.href = `grupo_detalhe.html?id=${grupo.id}`;

                    const actionsContainer = document.createElement('div');
                    actionsContainer.className = 'actions-container';

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'X';
                    deleteBtn.className = 'delete-btn delete-grupo-btn';
                    deleteBtn.dataset.id = grupo.id;

                    actionsContainer.appendChild(deleteBtn);
                    item.appendChild(link);
                    item.appendChild(actionsContainer);
                    listaGruposElement.appendChild(item);
                });
            }
        } catch (error) {
            showErrorToast("Não foi possível carregar os grupos.");
        }
    };

    // --- Lógica dos Formulários e Botões ---
    if (formCriarGrupo) {
        formCriarGrupo.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nomeGrupo = inputNovoGrupo.value;
            if (!nomeGrupo) {
                showErrorToast("Por favor, digite um nome para o grupo.");
                return;
            }
            try {
                await fetch('https://app-financas-matheus.onrender.com/api/grupos/', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ nome_grupo: nomeGrupo })
                });
                showSuccessToast("Grupo criado com sucesso!");
                inputNovoGrupo.value = '';
                carregarGrupos();
            } catch (error) {
                showErrorToast('Erro ao criar grupo.');
            }
        });
    }

    if (listaGruposElement) {
        listaGruposElement.addEventListener('click', async (event) => {
            if (event.target.classList.contains('delete-grupo-btn')) {
                event.preventDefault();
                const grupoId = event.target.dataset.id;
                if (!confirm('Tem certeza que deseja deletar este grupo?')) return;
                try {
                    const response = await fetch(`https://app-financas-matheus.onrender.com/api/grupos/${grupoId}/`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Token ${token}` }
                    });
                    if (response.status !== 204) throw new Error('Falha ao deletar o grupo.');
                    showSuccessToast("Grupo deletado com sucesso.");
                    carregarGrupos();
                } catch (error) {
                    showErrorToast('Não foi possível deletar o grupo.');
                }
            }
        });
    }

    carregarGrupos();
});