// frontend_web/calendario.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    const headers = { 'Authorization': `Token ${token}` };

    // Função auxiliar para notificações de erro
    const showErrorToast = (message) => {
        Toastify({
            text: message, duration: 3000, gravity: "top", position: "right",
            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
        }).showToast();
    };

    // --- LÓGICA DA PÁGINA DO CALENDÁRIO ---

    // 1. Seleciona o elemento HTML onde o calendário será desenhado
    const calendarioElement = document.getElementById('calendario');

    const carregarCalendario = async () => {
        // Garante que só vamos tentar criar o calendário se o elemento existir na página
        if (!calendarioElement) {
            console.error("Elemento com id 'calendario' não foi encontrado na página.");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/gastos-fixos/', { headers });
            if (!response.ok) throw new Error('Falha ao buscar dados.');

            const gastosFixos = await response.json();

            const eventosFormatados = gastosFixos.map(gasto => {
                return {
                    title: `${gasto.descricao} - R$ ${gasto.valor}`,
                    start: gasto.data_vencimento,
                    allDay: true,
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545'
                };
            });

            // 2. Inicializa o calendário usando a variável correta 'calendarioElement'
            const calendar = new FullCalendar.Calendar(calendarioElement, {
                initialView: 'dayGridMonth',
                locale: 'pt-br',
                height: 'auto', // Garante que todas as semanas sejam exibidas
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,dayGridDay'
                },
                events: eventosFormatados
            });

            calendar.render();

        } catch (error) {
            console.error("Erro ao carregar o calendário:", error);
            showErrorToast("Não foi possível carregar os dados para o calendário.");
        }
    };
    
    carregarCalendario();
});