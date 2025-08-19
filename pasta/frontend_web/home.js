document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Se não há token, o usuário não está logado. Volta para a página de login.
        window.location.href = 'index.html';
        return;
    }
    // Headers padrão para todas as requisições autenticadas
    const headers = { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
    };

    // --- Seletores de Elementos da Página ---
    const welcomeMessageElement = document.getElementById('welcome-message');
    const dinheiroLivreElement = document.getElementById('dinheiro-livre');
    const listaMetasElement = document.getElementById('lista-metas');
    const listaGastosFixosElement = document.getElementById('lista-gastos-fixos');
    const listaGruposElement = document.getElementById('lista-grupos');
    
    // Seletores do formulário de Renda
    const formCriarRenda = document.getElementById('form-criar-renda');
    const inputDescricaoRenda = document.getElementById('descricao-renda');
    const inputValorRenda = document.getElementById('valor-renda');
    const selectTipoRenda = document.getElementById('tipo-renda');

    // Seletores do formulário de Gastos Fixos
    const formCriarGastoFixo = document.getElementById('form-criar-gasto-fixo');
    const inputDescricaoGasto = document.getElementById('descricao-gasto-fixo');
    const inputValorGasto = document.getElementById('valor-gasto-fixo');
    const inputDataGasto = document.getElementById('data-gasto-fixo');
    
    // Seletores do formulário de Grupos
    const formCriarGrupo = document.getElementById('form-criar-grupo');
    const inputNovoGrupo = document.getElementById('nome-novo-grupo');


    // --- Função Principal para Carregar o Dashboard ---
    const carregarDashboard = async () => {
        try {
            const buscarDados = async (endpoint) => {
                const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/`, { headers: {'Authorization': `Token ${token}`} });
                if (!response.ok) throw new Error(`Falha ao buscar ${endpoint}`);
                return response.json();
            };

            // Busca todos os dados da API em paralelo para ser mais rápido
            const [rendas, gastosFixos, metas, grupos, depositos] = await Promise.all([
                buscarDados('rendas'),
                buscarDados('gastos-fixos'),
                buscarDados('metas-pessoais'),
                buscarDados('grupos'),
                buscarDados('depositos-meta')
            ]);
            
            // --- Lógica de cálculo do Dinheiro Livre ---
            const hoje = new Date();
            const mesAtual = hoje.getMonth();
            const anoAtual = hoje.getFullYear();
            const totalRendas = rendas.reduce((soma, r) => soma + parseFloat(r.valor), 0);
            const totalGastosFixos = gastosFixos.reduce((soma, g) => soma + parseFloat(g.valor), 0);
            const totalDepositosMes = depositos.filter(d => {
                const dataDeposito = new Date(d.data);
                return dataDeposito.getMonth() === mesAtual && dataDeposito.getFullYear() === anoAtual;
            }).reduce((soma, d) => soma + parseFloat(d.valor), 0);
            const dinheiroLivre = totalRendas - totalGastosFixos - totalDepositosMes;

            // Atualiza os elementos principais do dashboard
            dinheiroLivreElement.textContent = `R$ ${dinheiroLivre.toFixed(2)}`;
            welcomeMessageElement.textContent = 'Olá! Bem-vindo(a).';
            
            // --- Renderiza as listas na tela ---
            // Renderiza metas
            listaMetasElement.innerHTML = '';
            if (metas.length === 0) {
                listaMetasElement.innerHTML = '<li>Nenhuma meta criada.</li>';
            } else {
                metas.forEach(meta => {
                    const progresso = (meta.valor_atual / meta.valor_meta) * 100;
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.textContent = `${meta.nome} (Progresso: ${progresso.toFixed(1)}%)`;
                    link.href = `meta_detalhe.html?id=${meta.id}`;
                    item.appendChild(link);
                    listaMetasElement.appendChild(item);
                });
            }

            // Renderiza gastos fixos
            listaGastosFixosElement.innerHTML = '';
            if (gastosFixos.length === 0) {
                listaGastosFixosElement.innerHTML = '<li>Nenhum gasto fixo cadastrado.</li>';
            } else {
                gastosFixos.forEach(gasto => {
                    const item = document.createElement('li');
                    const dataFormatada = new Date(gasto.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR');
                    item.textContent = `${gasto.descricao} - R$ ${gasto.valor} (Vence em ${dataFormatada})`;
                    listaGastosFixosElement.appendChild(item);
                });
            }

            // Renderiza grupos
            listaGruposElement.innerHTML = '';
            if (grupos.length === 0) {
                listaGruposElement.innerHTML = '<li>Você ainda não participa de nenhum grupo.</li>';
            } else {
                grupos.forEach(grupo => {
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.textContent = `${grupo.nome_grupo} (Criado por: ${grupo.criador})`;
                    link.href = `grupo_detalhe.html?id=${grupo.id}`;
                    item.appendChild(link);
                    listaGruposElement.appendChild(item);
                });
            }

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            alert('Sua sessão pode ter expirado. Por favor, faça o login novamente.');
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        }
    };
    
    // --- LÓGICA DOS FORMULÁRIOS ---

    // Adicionar Renda
    if (formCriarRenda) {
        formCriarRenda.addEventListener('submit', async (event) => {
            event.preventDefault();
            const descricao = inputDescricaoRenda.value;
            const valor = inputValorRenda.value;
            const tipo = selectTipoRenda.value;
            if (!descricao || !valor) return;
            try {
                const response = await fetch('http://127.0.0.1:8000/api/rendas/', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ descricao, valor, tipo })
                });
                if (!response.ok) throw new Error('Falha ao adicionar renda.');
                formCriarRenda.reset();
                carregarDashboard();
            } catch (error) {
                console.error('Erro ao criar renda:', error);
                alert('Ocorreu um erro ao tentar adicionar a renda.');
            }
        });
    }

    // Adicionar Gasto Fixo
    if (formCriarGastoFixo) {
        formCriarGastoFixo.addEventListener('submit', async (event) => {
            event.preventDefault();
            const descricao = inputDescricaoGasto.value;
            const valor = inputValorGasto.value;
            const data_vencimento = inputDataGasto.value;
            if (!descricao || !valor || !data_vencimento) return;
            try {
                const response = await fetch('http://127.0.0.1:8000/api/gastos-fixos/', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ descricao, valor, data_vencimento })
                });
                if (!response.ok) throw new Error('Falha ao adicionar gasto fixo.');
                formCriarGastoFixo.reset();
                carregarDashboard();
            } catch (error) {
                console.error('Erro ao criar gasto fixo:', error);
                alert('Ocorreu um erro ao tentar adicionar o gasto fixo.');
            }
        });
    }

    // Adicionar Grupo
    if (formCriarGrupo) {
        formCriarGrupo.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nomeGrupo = inputNovoGrupo.value;
            if (!nomeGrupo) return;
            try {
                await fetch('http://127.0.0.1:8000/api/grupos/', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ nome_grupo: nomeGrupo })
                });
                inputNovoGrupo.value = '';
                carregarDashboard();
            } catch (error) {
                alert('Erro ao criar grupo.');
            }
        });
    }

    // --- CHAMADAS INICIAIS ---
    carregarDashboard();
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            carregarDashboard();
        }
    });
});