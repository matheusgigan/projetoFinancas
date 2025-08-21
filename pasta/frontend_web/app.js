// app.js - O CÉREBRO ÚNICO DA SUA APLICAÇÃO

document.addEventListener('DOMContentLoaded', () => {
    // --- PREPARAÇÃO E VALIDAÇÃO GERAL ---
    const token = localStorage.getItem('authToken');
    const headers = { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
    };
    // Helper para notificações de sucesso
    const showSuccessToast = (message) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
        }).showToast();
    };
    // Helper para notificações de erro
    const showErrorToast = (message) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
        }).showToast();
    };


    // --- LÓGICA DA PÁGINA DE LOGIN (INDEX.HTML) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        if (token) { window.location.href = 'home.html'; return; }
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
                    method: 'POST',
                    body: new URLSearchParams({ 'username': username, 'password': password })
                });
                const data = await response.json();
                if (!response.ok) { throw new Error(data.non_field_errors || 'Erro desconhecido.'); }
                
                showSuccessToast("Login bem-sucedido! Redirecionando...");
                localStorage.setItem('authToken', data.token);
                setTimeout(() => { window.location.href = 'home.html'; }, 2000);
            } catch (error) {
                console.error("Erro no login:", error);
                showErrorToast(`Falha no login: ${error.message}`);
            }
        });
    }

    // FIM DA PARTE 1
    // app.js - PARTE 2 DE 4

    // --- LÓGICA DA PÁGINA DE ADICIONAR (ADICIONAR.HTML) ---
    const formCriarRenda = document.getElementById('form-criar-renda');
    if (formCriarRenda) {
        const setupCreateForm = (form, endpoint, getBodyCallback) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                try {
                    const body = getBodyCallback(form);
                    if (body === null) return;
                    
                    const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/`, {
                        method: 'POST', headers, body: JSON.stringify(body)
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        const message = Object.values(errorData).flat().join(' ');
                        throw new Error(message || `Falha ao criar item.`);
                    }
                    showSuccessToast("Item adicionado! Redirecionando...");
                    setTimeout(() => { window.location.href = 'home.html'; }, 2000);
                } catch (error) {
                    console.error("Erro ao criar item:", error);
                    showErrorToast(`Erro: ${error.message}`);
                }
            });
        };

        // Configura o formulário de Renda
        setupCreateForm(formCriarRenda, 'rendas', (form) => {
            const descricao = form.querySelector('#descricao-renda').value;
            const valor = form.querySelector('#valor-renda').value;
            if (!descricao || !valor || parseFloat(valor) <= 0) {
                showErrorToast("Por favor, preencha a descrição e um valor positivo.");
                return null;
            }
            return { descricao, valor, tipo: form.querySelector('#tipo-renda').value };
        });

        // Configura o formulário de Gasto Fixo
        setupCreateForm(formCriarGastoFixo, 'gastos-fixos', (form) => {
            const descricao = form.querySelector('#descricao-gasto-fixo').value;
            const valor = form.querySelector('#valor-gasto-fixo').value;
            const data_vencimento = form.querySelector('#data-gasto-fixo').value;
            const categoria = form.querySelector('#categoria-gasto-fixo').value;
            if (!descricao || !valor || !data_vencimento) {
                showErrorToast("Por favor, preencha todos os campos do gasto fixo.");
                return null;
            };
            return { descricao, valor, data_vencimento, categoria };
        });

        // Configura o formulário de Meta Pessoal
        setupCreateForm(formCriarMeta, 'metas-pessoais', (form) => {
            const nome = form.querySelector('#nome-nova-meta').value;
            const valor_meta = form.querySelector('#valor-nova-meta').value;
            if (!nome || !valor_meta) {
                showErrorToast("Por favor, preencha todos os campos da meta.");
                return null;
            };
            return { nome, valor_meta };
        });

        // Configura o formulário de Grupo
        setupCreateForm(formCriarGrupo, 'grupos', (form) => {
            const nome_grupo = form.querySelector('#nome-novo-grupo').value;
            if (!nome_grupo) {
                showErrorToast("Por favor, digite um nome para o grupo.");
                return null;
            };
            return { nome_grupo };
        });
    }

    // FIM DA PARTE 2
    // app.js - PARTE 3 DE 4

    // --- LÓGICA DO DASHBOARD (HOME.HTML) ---
    const homeDashboard = document.getElementById('welcome-message');
    if (homeDashboard) {
        // Se este elemento existe, sabemos que estamos na home.html

        // --- Seletores de Elementos Específicos do Dashboard ---
        const loader = document.getElementById('loader');
        const dinheiroLivreElement = document.getElementById('dinheiro-livre');
        const listaMetasElement = document.getElementById('lista-metas');
        const listaGastosFixosElement = document.getElementById('lista-gastos-fixos');
        const listaGruposElement = document.getElementById('lista-grupos');
        const listaRendasElement = document.getElementById('lista-rendas');
        const logoutButton = document.getElementById('logout-btn');

        // Modal de Edição de Gasto Fixo
        const editModal = document.getElementById('edit-modal');
        const editForm = document.getElementById('form-editar-gasto-fixo');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const editGastoId = document.getElementById('edit-gasto-id');
        const editDescricao = document.getElementById('edit-descricao-gasto-fixo');
        const editValor = document.getElementById('edit-valor-gasto-fixo');
        const editData = document.getElementById('edit-data-gasto-fixo');
        
        // Modal de Edição de Meta
        const editMetaModal = document.getElementById('edit-meta-modal');
        const editMetaForm = document.getElementById('form-editar-meta');
        const cancelEditMetaBtn = document.getElementById('cancel-edit-meta-btn');
        const editMetaId = document.getElementById('edit-meta-id');
        const editNomeMeta = document.getElementById('edit-nome-meta');
        const editValorMeta = document.getElementById('edit-valor-meta');

        // Modal de Edição de Renda
        const editRendaModal = document.getElementById('edit-renda-modal');
        const editRendaForm = document.getElementById('form-editar-renda');
        const cancelEditRendaBtn = document.getElementById('cancel-edit-renda-btn');
        const editRendaId = document.getElementById('edit-renda-id');
        const editDescricaoRenda = document.getElementById('edit-descricao-renda');
        const editValorRenda = document.getElementById('edit-valor-renda');
        const editTipoRenda = document.getElementById('edit-tipo-renda');

        // --- Variável Global para a Instância do Gráfico ---
        let meuGrafico = null;

        // --- Função para Renderizar o Gráfico ---
        const renderizarGrafico = (dadosDoGrafico) => {
            const container = document.getElementById('grafico-gastos-container');
            const canvas = document.getElementById('grafico-gastos');
            if (!container || !canvas) return;
            
            const ctx = canvas.getContext('2d');
            if (meuGrafico) {
                meuGrafico.destroy();
            }

            // Só mostra o gráfico se houver dados
            if (dadosDoGrafico.data && dadosDoGrafico.data.length > 0) {
                container.style.display = 'block';
                meuGrafico = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: dadosDoGrafico.labels,
                        datasets: [{
                            label: 'Gastos em R$', data: dadosDoGrafico.data,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
                                'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'
                            ],
                            borderColor: 'rgba(255, 255, 255, 1)', borderWidth: 2
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { position: 'top' } } }
                });
            } else {
                container.style.display = 'none'; // Esconde o card do gráfico se não houver gastos
            }
        };

        // --- Função Principal para Carregar o Dashboard ---
        const carregarDashboard = async () => {
            if (!token) return;
            loader.style.display = 'flex';
            try {
                const buscarDados = async (endpoint) => {
                    const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/`, { headers: { 'Authorization': `Token ${token}` } });
                    if (!response.ok) throw new Error(`Falha ao buscar ${endpoint}`);
                    if (response.status === 204) return [];
                    return response.json();
                };

                const [rendas, gastosFixos, metas, grupos, depositos, contribuicoes, pagamentos, dadosDoGrafico] = await Promise.all([
                    buscarDados('rendas'), buscarDados('gastos-fixos'), buscarDados('metas-pessoais'),
                    buscarDados('grupos'), buscarDados('depositos-meta'), buscarDados('minhas-contribuicoes'),
                    buscarDados('pagamentos-gastos-fixos'), buscarDados('chart-data')
                ]);
                
                const hoje = new Date();
                const mesAtual = hoje.getMonth();
                const anoAtual = hoje.getFullYear();
                const totalRendas = rendas.reduce((soma, r) => soma + parseFloat(r.valor), 0);
                const pagamentosDoMes = pagamentos.filter(p => new Date(p.data_pagamento).getMonth() === mesAtual && new Date(p.data_pagamento).getFullYear() === anoAtual);
                const totalPagamentosMes = pagamentosDoMes.reduce((soma, p) => soma + parseFloat(p.valor_pagamento), 0);
                const totalDepositosMes = depositos.filter(d => new Date(d.data).getMonth() === mesAtual).reduce((soma, d) => soma + parseFloat(d.valor), 0);
                const totalContribuicoesMes = contribuicoes.filter(c => new Date(c.data).getMonth() === mesAtual).reduce((soma, c) => soma + parseFloat(c.valor_contribuicao), 0);
                const dinheiroLivre = totalRendas - totalPagamentosMes - totalDepositosMes - totalContribuicoesMes;
                
                dinheiroLivreElement.textContent = `R$ ${dinheiroLivre.toFixed(2)}`;
                welcomeMessageElement.textContent = 'Olá! Bem-vindo(a).';

                renderizarGrafico(dadosDoGrafico);

                // Renderiza Rendas
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

                // Renderiza Metas
                listaMetasElement.innerHTML = '';
                if (metas.length === 0) { listaMetasElement.innerHTML = '<li>Nenhuma meta criada.</li>'; }
                else {
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

                // Renderiza Gastos Fixos
                listaGastosFixosElement.innerHTML = '';
                if (gastosFixos.length === 0) { listaGastosFixosElement.innerHTML = '<li>Nenhum gasto fixo cadastrado.</li>'; }
                else {
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

                // Renderiza Grupos
                listaGruposElement.innerHTML = '';
                if (grupos.length === 0) { listaGruposElement.innerHTML = '<li>Você ainda não participa de nenhum grupo.</li>'; }
                else {
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
                console.error('Erro ao carregar dashboard:', error);
                showErrorToast("Sua sessão pode ter expirado. Por favor, faça o login novamente.");
                setTimeout(() => { localStorage.removeItem('authToken'); window.location.href = 'index.html'; }, 3000);
            } finally {
                loader.style.display = 'none';
            }
        };

        // --- LÓGICA DE INTERAÇÃO DO DASHBOARD ---
        
        // Logout
        // Logout
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                showSuccessToast("Você saiu com sucesso!");
                setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            });
        }

        // Ações na lista de Rendas (Editar, Deletar)
        if (listaRendasElement) {
            listaRendasElement.addEventListener('click', async (event) => {
                const target = event.target;
                const rendaId = target.dataset.id;

                if (target.classList.contains('edit-renda-btn')) {
                    try {
                        const response = await fetch(`http://127.0.0.1:8000/api/rendas/${rendaId}/`, { headers: { 'Authorization': `Token ${token}` } });
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
                        const response = await fetch(`http://127.0.0.1:8000/api/rendas/${rendaId}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
                        if (response.status !== 204) throw new Error('Falha ao deletar a renda.');
                        showSuccessToast("Renda deletada com sucesso.");
                        carregarDashboard();
                    } catch (error) { showErrorToast('Não foi possível deletar a renda.'); }
                }
            });
        }
        
        // Ações na lista de Gastos Fixos (Pagar, Editar, Deletar)
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

        // Ações na lista de Metas Pessoais (Editar, Deletar)
        if (listaMetasElement) {
            listaMetasElement.addEventListener('click', async (event) => {
                const target = event.target;
                const metaId = target.dataset.id;
                
                if (target.classList.contains('edit-meta-btn')) {
                    event.preventDefault();
                    try {
                        const response = await fetch(`http://127.0.0.1:8000/api/metas-pessoais/${metaId}/`, { headers: { 'Authorization': `Token ${token}` } });
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
                        const response = await fetch(`http://127.0.0.1:8000/api/metas-pessoais/${metaId}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
                        if (response.status !== 204) throw new Error('Falha ao deletar a meta.');
                        showSuccessToast("Meta deletada com sucesso.");
                        carregarDashboard();
                    } catch (error) { showErrorToast('Não foi possível deletar a meta.'); }
                }
            });
        }

        // Ações na lista de Grupos (Deletar)
        if (listaGruposElement) {
            listaGruposElement.addEventListener('click', async (event) => {
                if (event.target.classList.contains('delete-grupo-btn')) {
                    event.preventDefault();
                    const grupoId = event.target.dataset.id;
                    if (!confirm('Tem certeza que deseja deletar este grupo?')) return;
                    try {
                        const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
                        if (response.status !== 204) throw new Error('Falha ao deletar o grupo.');
                        showSuccessToast("Grupo deletado com sucesso.");
                        carregarDashboard();
                    } catch (error) { showErrorToast('Não foi possível deletar o grupo.'); }
                }
            });
        }

        // Ações dos Modais de Edição
        if (editRendaForm) {
            editRendaForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const rendaId = editRendaId.value;
                const dados = { descricao: editDescricaoRenda.value, valor: editValorRenda.value, tipo: editTipoRenda.value };
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/rendas/${rendaId}/`, { method: 'PATCH', headers, body: JSON.stringify(dados) });
                    if (!response.ok) throw new Error('Não foi possível salvar as alterações.');
                    editRendaModal.style.display = 'none';
                    showSuccessToast("Renda atualizada com sucesso!");
                    carregarDashboard();
                } catch (error) { showErrorToast(error.message); }
            });
        }
        if (cancelEditRendaBtn) { cancelEditRendaBtn.addEventListener('click', () => { editRendaModal.style.display = 'none'; }); }

        if (editMetaForm) {
            editMetaForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const metaId = editMetaId.value;
                const dados = { nome: editNomeMeta.value, valor_meta: editValorMeta.value };
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/metas-pessoais/${metaId}/`, { method: 'PATCH', headers, body: JSON.stringify(dados) });
                    if (!response.ok) throw new Error('Não foi possível salvar as alterações.');
                    editMetaModal.style.display = 'none';
                    showSuccessToast("Meta atualizada com sucesso!");
                    carregarDashboard();
                } catch (error) { showErrorToast(error.message); }
            });
        }
        if (cancelEditMetaBtn) { cancelEditMetaBtn.addEventListener('click', () => { editMetaModal.style.display = 'none'; }); }

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

        // --- CHAMADAS INICIAIS ---
        carregarDashboard();
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) { carregarDashboard(); }
        });
    }
    
    const grupoDetalhePage = document.getElementById('lista-membros');
    if (grupoDetalhePage) {
        // --- Se este elemento existe, estamos na grupo_detalhe.html ---

        // Pega o ID do grupo da URL
        const params = new URLSearchParams(window.location.search);
        const grupoId = params.get('id');

        // Seletores de elementos desta página
        const nomeGrupoElement = document.getElementById('nome-grupo');
        const listaMembrosElement = document.getElementById('lista-membros');
        const formConvidarMembro = document.getElementById('form-convidar-membro');
        const inputUsernameConvite = document.getElementById('username-convite');
        const listaMetasGrupoElement = document.getElementById('lista-metas-grupo');
        const formCriarMetaGrupo = document.getElementById('form-criar-meta-grupo');
        
        if (!token || !grupoId) {
            window.location.href = 'index.html';
        }

        // --- FUNÇÃO PRINCIPAL PARA CARREGAR TUDO DA PÁGINA ---
        const carregarDetalhes = async () => {
            try {
                const [grupo, metas] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/`, { headers }).then(res => res.json()),
                    fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/metas/`, { headers }).then(res => res.json())
                ]);

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
                    const card = document.createElement('div');
                    card.className = 'meta-card';
                    card.innerHTML = `
                        <h3>${meta.nome}</h3>
                        <p>Progresso: <b>${progresso.toFixed(1)}%</b></p>
                        <div class="progress-bar-container"><div class="progress-bar" style="width: ${progresso}%;"></div></div>
                        <p>R$ ${parseFloat(meta.valor_atual).toFixed(2)} / R$ ${parseFloat(meta.valor_meta).toFixed(2)}</p>
                        <h4>Contribuições:</h4>
                        <ul class="contribuicoes-lista">
                            ${meta.contribuicoes.map(c => `<li>${c.usuario}: R$ ${parseFloat(c.valor_contribuicao).toFixed(2)}</li>`).join('')}
                        </ul>
                        <form class="form-inline form-contribuir" data-meta-id="${meta.id}">
                            <input type="number" class="input-valor-contribuicao" placeholder="Seu valor" step="0.01" required>
                            <button type="submit">Contribuir</button>
                        </form>
                    `;
                    listaMetasGrupoElement.appendChild(card);
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
                const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/metas/`, { method: 'POST', headers, body: JSON.stringify({ nome: nome, valor_meta: valor }) });
                if (!response.ok) throw new Error('Falha ao criar a meta.');
                showSuccessToast("Meta de grupo criada!");
                formCriarMetaGrupo.reset();
                carregarDetalhes();
            } catch (error) { showErrorToast('Erro ao criar meta.'); }
        });

        // Adicionar contribuição a uma meta
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
                    const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/metas/${metaId}/contribuicoes/`, { method: 'POST', headers, body: JSON.stringify({ valor: valor }) });
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
                const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/convidar/`, { method: 'POST', headers, body: JSON.stringify({ username: username }) });
                const data = await response.json();
                if (!response.ok) { throw new Error(data.erro || 'Não foi possível convidar o usuário.'); }
                showSuccessToast(data.sucesso);
                inputUsernameConvite.value = '';
                carregarDetalhes();
            } catch (error) { showErrorToast(error.message); }
        });

        // --- Chamada Inicial ---
        carregarDetalhes();
    }

    // FIM DA LÓGICA DE GRUPO_DETALHE.HTML

    // --- LÓGICA DA PÁGINA DE DETALHES DA META ---
   // app.js - LÓGICA DA PÁGINA DE DETALHES DA META PESSOAL

    const metaDetalhePage = document.getElementById('nome-meta');
    if (metaDetalhePage && document.getElementById('form-depositar')) {
        // --- Se estes elementos existem, estamos na meta_detalhe.html ---

        const params = new URLSearchParams(window.location.search);
        const metaId = params.get('id');

        // Seletores de elementos desta página
        const nomeMetaElement = document.getElementById('nome-meta');
        const progressoTextoElement = document.getElementById('progresso-texto');
        const progressBarElement = document.getElementById('progress-bar');
        const valorAtualElement = document.getElementById('valor-atual');
        const valorMetaElement = document.getElementById('valor-meta');
        const formDepositar = document.getElementById('form-depositar');
        const inputDeposito = document.getElementById('valor-deposito');

        if (!token || !metaId) {
            window.location.href = 'index.html';
        }

        // --- Função para buscar e atualizar os dados da meta na tela ---
        const atualizarDadosMeta = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/metas-pessoais/${metaId}/`, { headers });
                if (!response.ok) throw new Error('Falha ao buscar meta.');
                const meta = await response.json();

                nomeMetaElement.textContent = meta.nome;
                valorAtualElement.textContent = `R$ ${parseFloat(meta.valor_atual).toFixed(2)}`;
                valorMetaElement.textContent = `R$ ${parseFloat(meta.valor_meta).toFixed(2)}`;
                
                const progresso = (parseFloat(meta.valor_atual) / parseFloat(meta.valor_meta)) * 100;
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
    }
    
    // FIM DA LÓGICA DE META_DETALHE.HTML

    // --- LÓGICA DA PÁGINA DO CALENDÁRIO ---
    const calendarioPage = document.getElementById('calendario');
    if (calendarioPage) {
        // --- Se este elemento existe, estamos na calendario.html ---

        if (!token) {
            window.location.href = 'index.html';
        }

        const carregarCalendario = async () => {
            try {
                // 1. Busca os dados dos gastos fixos na nossa API
                const response = await fetch('http://127.0.0.1:8000/api/gastos-fixos/', { headers });
                if (!response.ok) throw new Error('Falha ao buscar dados.');

                const gastosFixos = await response.json();

                // 2. Transforma nossos dados para o formato que o FullCalendar espera
                const eventosFormatados = gastosFixos.map(gasto => {
                    return {
                        title: `${gasto.descricao} - R$ ${gasto.valor}`, // O texto que aparece no evento
                        start: gasto.data_vencimento, // A data de início do evento
                        allDay: true // O evento dura o dia todo
                    };
                });

                // 3. Inicializa o calendário
                const calendar = new FullCalendar.Calendar(calendarioPage, {
                    initialView: 'dayGridMonth', // Visão de mês
                    locale: 'pt-br', // Traduz para o português
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek' // Opções de visualização
                    },
                    events: eventosFormatados // Aqui passamos nossos gastos como eventos!
                });

                // 4. Desenha o calendário na tela
                calendar.render();

            } catch (error) {
                console.error("Erro ao carregar o calendário:", error);
                showErrorToast("Não foi possível carregar os dados para o calendário.");
            }
        };
        
        carregarCalendario();
    }

    // --- LÓGICA DA PÁGINA DO RELATÓRIO ---
    const relatorioPage = document.getElementById('corpo-tabela-extrato');
    if (relatorioPage) {
        // --- Se este elemento existe, estamos na relatorio.html ---
        
        if (!token) {
            window.location.href = 'index.html';
        }

        const carregarExtrato = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/extrato/', { headers });
                if (!response.ok) throw new Error('Falha ao buscar extrato.');
                
                const transacoes = await response.json();

                relatorioPage.innerHTML = ''; // Limpa a mensagem de "Carregando..."

                if (transacoes.length === 0) {
                    relatorioPage.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma transação encontrada.</td></tr>';
                    return;
                }

                // Para cada transação, cria uma nova linha <tr> na tabela
                transacoes.forEach(t => {
                    const linha = document.createElement('tr');
                    const dataFormatada = new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR');
                    const valor = parseFloat(t.valor);
                    
                    const classeValor = valor >= 0 ? 'valor-positivo' : 'valor-negativo';

                    linha.innerHTML = `
                        <td>${dataFormatada}</td>
                        <td>${t.descricao}</td>
                        <td>${t.tipo}</td>
                        <td class="${classeValor}">${valor.toFixed(2)}</td>
                    `;
                    relatorioPage.appendChild(linha);
                });

            } catch (error) {
                console.error("Erro ao carregar o extrato:", error);
                relatorioPage.innerHTML = '<tr><td colspan="4" style="text-align: center;">Erro ao carregar transações.</td></tr>';
            }
        };

        carregarExtrato();
    }
    
}); // <-- FIM DO SCRIPT