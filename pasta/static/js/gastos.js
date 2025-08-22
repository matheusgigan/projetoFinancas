// frontend_web/gastos.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'index.html'; return; }
    const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };

    const showSuccessToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
    const showErrorToast = (message) => Toastify({ text: message, duration: 3000, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();

    // --- Seletores ---
    const listaGastosFixosElement = document.getElementById('lista-gastos-fixos');
    const formCriarGastoFixo = document.getElementById('form-criar-gasto-fixo');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('form-editar-gasto-fixo');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Função Principal para Carregar os Gastos ---
    const carregarGastos = async () => {
        try {
            const [gastosFixos, pagamentos] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/gastos-fixos/', { headers: { 'Authorization': `Token ${token}` } }).then(res => res.json()),
                fetch('http://127.0.0.1:8000/api/pagamentos-gastos-fixos/', { headers: { 'Authorization': `Token ${token}` } }).then(res => res.json())
            ]);

            listaGastosFixosElement.innerHTML = '';
            if (gastosFixos.length === 0) {
                listaGastosFixosElement.innerHTML = '<li>Nenhum gasto fixo cadastrado.</li>';
            } else {
                const hoje = new Date();
                const mesAtual = hoje.getMonth();
                const anoAtual = hoje.getFullYear();
                const pagamentosDoMes = pagamentos.filter(p => new Date(p.data_pagamento).getMonth() === mesAtual && new Date(p.data_pagamento).getFullYear() === anoAtual);
                const idsGastosPagos = pagamentosDoMes.map(p => p.gasto_fixo);

                gastosFixos.forEach(gasto => {
                    const item = document.createElement('li');
                    const texto = document.createElement('span');
                    const dataFormatada = new Date(gasto.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR');
                    texto.textContent = `${gasto.descricao} - R$ ${gasto.valor} (Vence em ${dataFormatada})`;

                    const actionsContainer = document.createElement('div');
                    actionsContainer.className = 'actions-container';

                    if (idsGastosPagos.includes(gasto.id)) {
                        const status = document.createElement('span');
                        status.textContent = 'Pago ✔';
                        status.className = 'status-pago';
                        actionsContainer.appendChild(status);
                    } else {
                        const payBtn = document.createElement('button');
                        payBtn.textContent = 'Pagar';
                        payBtn.className = 'pay-btn';
                        payBtn.dataset.id = gasto.id;
                        actionsContainer.appendChild(payBtn);
                    }

                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Editar';
                    editBtn.className = 'edit-btn edit-gasto-btn';
                    editBtn.dataset.id = gasto.id;
                    actionsContainer.appendChild(editBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'X';
                    deleteBtn.className = 'delete-btn delete-gasto-btn';
                    deleteBtn.dataset.id = gasto.id;
                    actionsContainer.appendChild(deleteBtn);

                    item.appendChild(texto);
                    item.appendChild(actionsContainer);
                    listaGastosFixosElement.appendChild(item);
                });
            }
        } catch (error) {
            showErrorToast("Não foi possível carregar os gastos.");
        }
    };

    // --- Lógica dos Formulários e Botões ---
    if (formCriarGastoFixo) {
        const inputDescricaoGasto = document.getElementById('descricao-gasto-fixo');
        const inputValorGasto = document.getElementById('valor-gasto-fixo');
        const inputDataGasto = document.getElementById('data-gasto-fixo');
        const selectCategoriaGasto = document.getElementById('categoria-gasto-fixo');

        // Ouvinte de evento para o envio do formulário
        formCriarGastoFixo.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const descricao = inputDescricaoGasto.value;
            const valor = inputValorGasto.value;
            const data_vencimento = inputDataGasto.value;
            const categoria = selectCategoriaGasto.value;

            // Validação simples
            if (!descricao || !valor || !data_vencimento || !categoria) {
                showErrorToast('Por favor, preencha todos os campos.');
                return;
            }

            // Envio para a API
            try {
                const response = await fetch('http://127.0.0.1:8000/api/gastos-fixos/', {
                    method: 'POST',
                    headers: headers, // 'headers' deve estar definido no escopo superior
                    body: JSON.stringify({ 
                        descricao, 
                        valor, 
                        data_vencimento, 
                        categoria 
                    })
                });
                if (!response.ok) throw new Error('Falha ao adicionar o gasto fixo.');
                
                showSuccessToast("Gasto fixo adicionado com sucesso!");
                formCriarGastoFixo.reset(); // Limpa os campos do formulário
                carregarGastos(); // Recarrega a lista de gastos na tela

            } catch (error) {
                console.error('Erro ao criar gasto fixo:', error);
                showErrorToast('Ocorreu um erro ao tentar adicionar o gasto fixo.');
            }
        });
    }
        if (listaGastosFixosElement) {
        listaGastosFixosElement.addEventListener('click', async (event) => {
            const target = event.target;
            const gastoId = target.dataset.id;

            if (target.classList.contains('pay-btn')) {
                if (!confirm('Tem certeza que deseja marcar esta conta como paga?')) return;
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/pagamentos-gastos-fixos/`, { method: 'POST', headers, body: JSON.stringify({ gasto_fixo_id: gastoId }) });
                    if (!response.ok) {
                        const errorData = await response.json();
                        const errorMessage = (errorData.non_field_errors && errorData.non_field_errors[0]) || 'Falha ao marcar como pago.';
                        throw new Error(errorMessage);
                    }
                    showSuccessToast("Gasto marcado como pago!");
                    carregarDashboard();
                } catch (error) { showErrorToast(error.message); }
            }
            
            if (target.classList.contains('delete-gasto-btn')) {
                if (!confirm('Tem certeza que deseja deletar este gasto fixo?')) return;
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/gastos-fixos/${gastoId}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
                    if (response.status !== 204) throw new Error('Falha ao deletar o gasto fixo.');
                    showSuccessToast("Gasto fixo deletado.");
                    carregarDashboard();
                } catch (error) { showErrorToast('Não foi possível deletar o gasto fixo.'); }
            }

            if (target.classList.contains('edit-gasto-btn')) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/gastos-fixos/${gastoId}/`, { headers: { 'Authorization': `Token ${token}` } });
                    if (!response.ok) throw new Error('Falha ao buscar dados do gasto.');
                    const gasto = await response.json();
                    editGastoId.value = gasto.id;
                    editDescricao.value = gasto.descricao;
                    editValor.value = gasto.valor;
                    editData.value = gasto.data_vencimento;
                    editModal.style.display = 'flex';
                } catch (error) { showErrorToast(error.message); }
            }
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const gastoId = editGastoId.value;
            const dados = { descricao: editDescricao.value, valor: editValor.value, data_vencimento: editData.value };
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/gastos-fixos/${gastoId}/`, { method: 'PATCH', headers, body: JSON.stringify(dados) });
                if (!response.ok) throw new Error('Não foi possível salvar as alterações.');
                editModal.style.display = 'none';
                showSuccessToast("Gasto fixo atualizado com sucesso!");
                carregarDashboard();
            } catch (error) { showErrorToast(error.message); }
        });
    }
    
    if (cancelEditBtn) { cancelEditBtn.addEventListener('click', () => { editModal.style.display = 'none'; }); }

    carregarGastos();
});