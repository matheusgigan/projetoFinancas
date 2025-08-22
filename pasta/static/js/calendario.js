// frontend_web/calendario.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Validações e Preparação ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    const headers = { 'Authorization': `Token ${token}` };
    
    // Funções auxiliares para notificações (Toastify)
    const showErrorToast = (message) => {
        Toastify({
            text: message, duration: 3000, gravity: "top", position: "right",
            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
        }).showToast();
    };

    // --- LÓGICA DA PÁGINA DO CALENDÁRIO ---
    const calendarioElement = document.getElementById('calendario');

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
                    allDay: true, // O evento dura o dia todo
                    backgroundColor: '#dc3545', // Deixa o evento vermelho
                    borderColor: '#dc3545'      // Cor da borda
                };
            });

            // 3. Inicializa o calendário
            const calendar = new FullCalendar.Calendar(calendarioElement, {
                initialView: 'dayGridMonth', // Visão de mês
                locale: 'pt-br', // Traduz para o português
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,dayGridDay' // Opções de visualização
                },
                events: eventosFormatados, // Aqui passamos nossos gastos como eventos!
                eventTimeFormat: { // Para não mostrar a hora em eventos de dia todo
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }
            });

            // 4. Desenha o calendário na tela
            calendar.render();

        } catch (error) {
            console.error("Erro ao carregar o calendário:", error);
            showErrorToast("Não foi possível carregar os dados para o calendário.");
        }
    };
    
    carregarCalendario();
});