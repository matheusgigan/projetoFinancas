// frontend_web/estatisticas.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    const headers = { 'Authorization': `Token ${token}` };
    
    // Funções auxiliares para notificações (caso precise no futuro)
    const showErrorToast = (message) => {
        Toastify({
            text: message, duration: 3000, gravity: "top", position: "right",
            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
        }).showToast();
    };

    // --- Variável Global para a Instância do Gráfico ---
    let meuGrafico = null;

    // --- Função para Renderizar o Gráfico ---
    const renderizarGrafico = (dadosDoGrafico) => {
        const container = document.getElementById('grafico-gastos-container');
        const canvas = document.getElementById('grafico-gastos');
        if (!container || !canvas) {
            console.error("Elemento canvas ou container do gráfico não encontrado no HTML.");
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (meuGrafico) {
            meuGrafico.destroy();
        }

        // Só mostra o gráfico se houver dados
        if (dadosDoGrafico && dadosDoGrafico.data && dadosDoGrafico.data.length > 0) {
            container.style.display = 'block';
            meuGrafico = new Chart(ctx, {
                type: 'pie', // Tipo de gráfico (pizza)
                data: {
                    labels: dadosDoGrafico.labels, // Nomes das categorias
                    datasets: [{
                        label: 'Gastos em R$',
                        data: dadosDoGrafico.data, // Valores de cada categoria
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'
                        ],
                        borderColor: 'rgba(255, 255, 255, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        } else {
            // Se não houver dados, esconde o card e mostra uma mensagem
            container.innerHTML = '<h2>Gastos por Categoria</h2><p>Nenhum gasto categorizado foi pago este mês para exibir no gráfico.</p>';
        }
    };

    // --- Função Principal para Carregar os Dados ---
    const carregarEstatisticas = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/chart-data/`, { headers });
            if (!response.ok) throw new Error(`Falha ao buscar dados do gráfico`);
            const dadosDoGrafico = await response.json();
            renderizarGrafico(dadosDoGrafico);
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
            showErrorToast("Não foi possível carregar os dados do gráfico.");
        }
    };

    // --- Chamada Inicial ---
    carregarEstatisticas();
});