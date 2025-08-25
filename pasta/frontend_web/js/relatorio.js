// frontend_web/relatorio.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    const headers = { 'Authorization': `Token ${token}` };

    // --- Seletor de Elemento ---
    const corpoTabela = document.getElementById('corpo-tabela-extrato');

    // --- Função para Carregar o Extrato ---
    const carregarExtrato = async () => {
        try {
            // 1. Busca os dados do nosso endpoint de extrato unificado
            const response = await fetch('https://app-financas-matheus.onrender.com/api/extrato/', { headers });
            if (!response.ok) throw new Error('Falha ao buscar extrato.');
            
            const transacoes = await response.json();

            // Limpa a mensagem de "Carregando..."
            corpoTabela.innerHTML = '';

            if (transacoes.length === 0) {
                corpoTabela.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma transação encontrada.</td></tr>';
                return;
            }

            // 2. Para cada transação, cria uma nova linha <tr> na tabela
            transacoes.forEach(t => {
                const linha = document.createElement('tr');

                // Garante que a data seja tratada corretamente
                const dataFormatada = new Date(t.data.includes('T') ? t.data : t.data + 'T00:00:00').toLocaleDateString('pt-BR');
                const valor = parseFloat(t.valor);
                
                // Adiciona uma classe CSS diferente para valores positivos e negativos
                const classeValor = valor >= 0 ? 'valor-positivo' : 'valor-negativo';

                linha.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${t.descricao}</td>
                    <td>${t.tipo}</td>
                    <td class="${classeValor}">${valor.toFixed(2)}</td>
                `;

                corpoTabela.appendChild(linha);
            });

        } catch (error) {
            console.error("Erro ao carregar o extrato:", error);
            corpoTabela.innerHTML = '<tr><td colspan="4" style="text-align: center;">Erro ao carregar transações.</td></tr>';
        }
    };

    // --- Chamada Inicial ---
    carregarExtrato();
});