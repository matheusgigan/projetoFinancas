// frontend_web/home.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'index.html'; return; }
    const headers = { 'Authorization': `Token ${token}` };

    const showSuccessToast = (message) => Toastify({ text: message, duration: 2000, style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
    const showErrorToast = (message) => Toastify({ text: message, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();

    // --- Seletores dos novos elementos do Dashboard ---
    const loader = document.getElementById('loader');
    const dinheiroLivreElement = document.getElementById('dinheiro-livre');
    const listaLembretesElement = document.getElementById('lista-lembretes-gastos');
    const bannersMetasPessoais = document.getElementById('banners-metas-pessoais');
    const logoutButton = document.getElementById('logout-btn');

    const carregarDashboard = async () => {
        loader.style.display = 'flex';
        try {
            const buscarDados = async (endpoint) => {
                const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/`, { headers });
                if (!response.ok) throw new Error(`Falha ao buscar ${endpoint}`);
                if (response.status === 204) return [];
                return response.json();
            };

            const [rendas, gastosFixos, metasPessoais, depositos, contribuicoes, pagamentos] = await Promise.all([
                buscarDados('rendas'), buscarDados('gastos-fixos'), buscarDados('metas-pessoais'),
                buscarDados('depositos-meta'), buscarDados('minhas-contribuicoes'),
                buscarDados('pagamentos-gastos-fixos')
            ]);

            // --- Cálculo do Dinheiro Livre (sem mudanças) ---
            const hoje = new Date();
            const mesAtual = hoje.getMonth();
            const anoAtual = hoje.getFullYear();
            const totalRendas = rendas.reduce((soma, r) => soma + parseFloat(r.valor), 0);
            const pagamentosDoMes = pagamentos.filter(p => new Date(p.data_pagamento).getMonth() === mesAtual);
            const totalPagamentosMes = pagamentosDoMes.reduce((soma, p) => soma + parseFloat(p.valor_pagamento), 0);
            const totalDepositosMes = depositos.filter(d => new Date(d.data).getMonth() === mesAtual).reduce((soma, d) => soma + parseFloat(d.valor), 0);
            const totalContribuicoesMes = contribuicoes.filter(c => new Date(c.data).getMonth() === mesAtual).reduce((soma, c) => soma + parseFloat(c.valor_contribuicao), 0);
            const dinheiroLivre = totalRendas - totalPagamentosMes - totalDepositosMes - totalContribuicoesMes;
            dinheiroLivreElement.textContent = `R$ ${dinheiroLivre.toFixed(2)}`;

            // --- Renderizar Lembretes de Gastos Fixos ---
            listaLembretesElement.innerHTML = '';
            const idsGastosPagos = pagamentosDoMes.map(p => p.gasto_fixo);
            const gastosNaoPagos = gastosFixos.filter(g => !idsGastosPagos.includes(g.id));
            gastosNaoPagos.sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));

            if (gastosNaoPagos.length === 0) {
                listaLembretesElement.innerHTML = '<li>Todas as contas fixas foram pagas este mês! 🎉</li>';
            } else {
                gastosNaoPagos.slice(0, 3).forEach(gasto => {
                    const item = document.createElement('li');
                    const dataFormatada = new Date(gasto.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR');
                    item.innerHTML = `<span>${gasto.descricao} (Vence em ${dataFormatada})</span> <strong>R$ ${gasto.valor}</strong>`;
                    listaLembretesElement.appendChild(item);
                });
            }

            // --- Renderizar Banners de Metas Pessoais ---
            bannersMetasPessoais.innerHTML = '';
            if (metasPessoais.length === 0) {
                bannersMetasPessoais.innerHTML = '<p>Nenhuma meta de poupança criada. Crie uma na tela de Metas!</p>';
            } else {
                metasPessoais.slice(0, 2).forEach(meta => { // Mostra no máximo 2 banners
                    const progresso = (parseFloat(meta.valor_atual) / parseFloat(meta.valor_meta)) * 100;
                    const banner = document.createElement('div');
                    banner.className = 'meta-banner';
                    banner.innerHTML = `
                        <p><a href="meta_detalhe.html?id=${meta.id}"><strong>${meta.nome}</strong></a></p>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progresso > 100 ? 100 : progresso.toFixed(1)}%;"></div>
                        </div>
                        <p>R$ ${parseFloat(meta.valor_atual).toFixed(2)} / R$ ${parseFloat(meta.valor_meta).toFixed(2)}</p>
                    `;
                    bannersMetasPessoais.appendChild(banner);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            loader.style.display = 'none';
        }
    };

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            showSuccessToast('Você saiu com sucesso!');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        });
    }

    carregarDashboard();
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            carregarDashboard();
        }
    });
});