// grupo_detalhe.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const nomeGrupoElement = document.getElementById('nome-grupo');
    const listaDespesasElement = document.getElementById('lista-despesas');
    const formAddDespesa = document.getElementById('form-add-despesa');
    const inputDescricao = document.getElementById('descricao-despesa');
    const inputValor = document.getElementById('valor-despesa');

    // Pega os parâmetros da URL (ex: ?id=1)
    const params = new URLSearchParams(window.location.search);
    const grupoId = params.get('id');

    // Validações iniciais
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    if (!grupoId) {
        alert('ID do grupo não encontrado.');
        window.location.href = 'home.html';
        return;
    }

    // --- FUNÇÃO PARA BUSCAR E EXIBIR AS DESPESAS ---
    const buscarDespesas = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/despesas/`, {
                method: 'GET',
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar despesas.');
            
            const despesas = await response.json();
            listaDespesasElement.innerHTML = ''; // Limpa a lista

            if (despesas.length === 0) {
                listaDespesasElement.innerHTML = '<li>Nenhuma despesa registrada neste grupo.</li>';
            } else {
                despesas.forEach(despesa => {
                    const item = document.createElement('li');
                    item.textContent = `${despesa.descricao} - R$ ${despesa.valor} (Pago por: ${despesa.pago_por})`;
                    listaDespesasElement.appendChild(item);
                });
            }
        } catch (error) {
            console.error('Erro:', error);
            // Poderia redirecionar ou mostrar uma mensagem de erro na tela
        }
    };

    // --- FUNÇÃO PARA BUSCAR O NOME DO GRUPO ---
    const buscarNomeDoGrupo = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/`, {
                method: 'GET',
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar nome do grupo.');
            const grupo = await response.json();
            nomeGrupoElement.textContent = `Grupo: ${grupo.nome_grupo}`;
        } catch (error) {
            console.error('Erro:', error);
            nomeGrupoElement.textContent = 'Erro ao carregar grupo';
        }
    };
    
    // --- LÓGICA PARA ADICIONAR UMA NOVA DESPESA ---
    formAddDespesa.addEventListener('submit', async (event) => {
        event.preventDefault();
        const descricao = inputDescricao.value;
        const valor = inputValor.value;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/despesas/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ descricao: descricao, valor: valor })
            });
            if (!response.ok) throw new Error('Falha ao adicionar despesa.');
            
            // Limpa os campos e atualiza a lista
            inputDescricao.value = '';
            inputValor.value = '';
            buscarDespesas();

        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível adicionar a despesa.');
        }
    });

    // --- CHAMADAS INICIAIS ---
    buscarNomeDoGrupo();
    buscarDespesas();
});