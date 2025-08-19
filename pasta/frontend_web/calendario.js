// calendario.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    const headers = { 'Authorization': `Token ${token}` };

    try {
        // 1. Busca os dados dos gastos fixos na nossa API
        const response = await fetch('http://127.0.0.1:8000/api/gastos-fixos/', { headers });
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
        const calendarEl = document.getElementById('calendario');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth', // Visão de mês
            locale: 'pt-br', // Traduz para o português
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            events: eventosFormatados // Aqui passamos nossos gastos como eventos!
        });

        // 4. Desenha o calendário na tela
        calendar.render();

    } catch (error) {
        console.error("Erro ao carregar o calendário:", error);
        alert("Não foi possível carregar os dados para o calendário.");
    }
});