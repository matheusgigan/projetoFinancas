// frontend_web/rendas.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'index.html'; return; }
    const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };

    const showSuccessToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
    const showErrorToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();

    const listaRendasElement = document.getElementById('lista-rendas');
    const formCriarRenda = document.getElementById('form-criar-renda');
    const editRendaModal = document.getElementById('edit-renda-modal');
    const editRendaForm = document.getElementById('form-editar-renda');
    const cancelEditRendaBtn = document.getElementById('cancel-edit-renda-btn');

    const carregarRendas = async () => {
        try {
            const response = await fetch('https://app-financas-matheus.onrender.com/api/rendas/', { headers: { 'Authorization': `Token ${token}` } });
            const rendas = await response.json();

            listaRendasElement.innerHTML = '';
            if (rendas.length === 0) { listaRendasElement.innerHTML = '<li>Nenhuma renda cadastrada.</li>'; }
            else {
                rendas.forEach(renda => {
                    const item = document.createElement('li');
                    const texto = document.createElement('span');
                    texto.textContent = `${renda.descricao} (${renda.tipo}) - R$ ${parseFloat(renda.valor).toFixed(2)}`;
                    const actionsContainer = document.createElement('div');
                    actionsContainer.className = 'actions-container';
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Editar';
                    editBtn.className = 'edit-btn edit-renda-btn';
                    editBtn.dataset.id = renda.id;
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'X';
                    deleteBtn.className = 'delete-btn delete-renda-btn';
                    deleteBtn.dataset.id = renda.id;
                    actionsContainer.appendChild(editBtn);
                    actionsContainer.appendChild(deleteBtn);
                    item.appendChild(texto);
                    item.appendChild(actionsContainer);
                    listaRendasElement.appendChild(item);
                });
            }
        } catch (error) { showErrorToast("Não foi possível carregar as rendas."); }
    };
    
    if (formCriarRenda) {
        const inputDescricaoRenda = document.getElementById('descricao-renda');
        const inputValorRenda = document.getElementById('valor-renda');
        const selectTipoRenda = document.getElementById('tipo-renda');
        
        // Ouvinte de evento para o envio do formulário
        formCriarRenda.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Validação dos campos
            const errorDescricao = document.getElementById('error-descricao-renda');
            const errorValor = document.getElementById('error-valor-renda');
            errorDescricao.textContent = '';
            errorValor.textContent = '';
            inputDescricaoRenda.classList.remove('input-invalid');
            inputValorRenda.classList.remove('input-invalid');

            const descricao = inputDescricaoRenda.value;
            const valor = inputValorRenda.value;
            const tipo = selectTipoRenda.value;
            
            let isValid = true;
            if (descricao.trim() === '') {
                errorDescricao.textContent = 'Campo obrigatório.';
                inputDescricaoRenda.classList.add('input-invalid');
                isValid = false;
            }
            if (valor.trim() === '') {
                errorValor.textContent = 'Campo obrigatório.';
                inputValorRenda.classList.add('input-invalid');
                isValid = false;
            } else if (parseFloat(valor) <= 0) {
                errorValor.textContent = 'O valor deve ser positivo.';
                inputValorRenda.classList.add('input-invalid');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Envio para a API
            try {
                const response = await fetch('https://app-financas-matheus.onrender.com/api/rendas/', {
                    method: 'POST',
                    headers: headers, // 'headers' deve estar definido no escopo superior
                    body: JSON.stringify({ descricao, valor, tipo })
                });
                if (!response.ok) throw new Error('Falha ao adicionar renda.');
                
                showSuccessToast("Renda adicionada com sucesso!");
                formCriarRenda.reset(); // Limpa os campos do formulário
                carregarRendas(); // Recarrega a lista de rendas na tela

            } catch (error) {
                console.error('Erro ao criar renda:', error);
                showErrorToast('Ocorreu um erro ao tentar adicionar a renda.');
            }
        });
    }


    if (listaRendasElement) {
        listaRendasElement.addEventListener('click', async (event) => {
            const target = event.target;
            const rendaId = target.dataset.id;

            if (target.classList.contains('edit-renda-btn')) {
                try {
                    const response = await fetch(`https://app-financas-matheus.onrender.com/api/rendas/${rendaId}/`, { headers: { 'Authorization': `Token ${token}` } });
                    if (!response.ok) throw new Error('Falha ao buscar dados da renda.');
                    const renda = await response.json();
                    editRendaId.value = renda.id;
                    editDescricaoRenda.value = renda.descricao;
                    editValorRenda.value = renda.valor;
                    editTipoRenda.value = renda.tipo;
                    editRendaModal.style.display = 'flex';
                } catch (error) { showErrorToast(error.message); }
            }

            if (target.classList.contains('delete-renda-btn')) {
                if (!confirm('Tem certeza que deseja deletar esta renda?')) return;
                try {
                    const response = await fetch(`https://app-financas-matheus.onrender.com/api/rendas/${rendaId}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
                    if (response.status !== 204) throw new Error('Falha ao deletar a renda.');
                    showSuccessToast("Renda deletada com sucesso.");
                    carregarDashboard();
                } catch (error) { showErrorToast('Não foi possível deletar a renda.'); }
            }
        });
    }

    if (editRendaForm) {
        editRendaForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const rendaId = editRendaId.value;
            const dados = { descricao: editDescricaoRenda.value, valor: editValorRenda.value, tipo: editTipoRenda.value };
            try {
                const response = await fetch(`https://app-financas-matheus.onrender.com/api/rendas/${rendaId}/`, { method: 'PATCH', headers, body: JSON.stringify(dados) });
                if (!response.ok) throw new Error('Não foi possível salvar as alterações.');
                editRendaModal.style.display = 'none';
                showSuccessToast("Renda atualizada com sucesso!");
                carregarDashboard();
            } catch (error) { showErrorToast(error.message); }
        });
    }

    if (cancelEditRendaBtn) { cancelEditRendaBtn.addEventListener('click', () => { editRendaModal.style.display = 'none'; }); }

    carregarRendas();
});