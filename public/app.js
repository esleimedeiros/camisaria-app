// ==========================================
// 1. LÓGICA DE AUTENTICAÇÃO (LOGIN E CADASTRO)
// ==========================================
const authForm = document.getElementById('auth-form');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const accessCode = document.getElementById('accessCode') ? document.getElementById('accessCode').value : null;
        
        const isLogin = !document.getElementById('accessCode');
        const endpoint = isLogin ? '/api/login' : '/api/register';
        const body = isLogin ? { username, password } : { username, password, accessCode };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            
            if (res.ok && isLogin) {
                alert(data.message);
                // Salva o nome do representante na memória do navegador
                localStorage.setItem('representanteLogado', data.username);
                window.location.href = '/dashboard.html';
            } else if (res.ok && !isLogin) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor.');
        }
    });
}

// ==========================================
// 2. LÓGICA DE SALVAR/ATUALIZAR O PEDIDO
// ==========================================
const imprimirBtn = document.getElementById('imprimir-btn');
if (imprimirBtn) {
    imprimirBtn.addEventListener('click', async () => {
        const cliente_nome = document.getElementById('cliente_nome').value;
        const telefone = document.getElementById('cliente_tel').value;
        const data_pedido = document.getElementById('data_pedido').value;
        const valor_total = parseFloat(document.getElementById('val_total').value) || 0;
        const status = document.getElementById('status') ? document.getElementById('status').value : 'Aguardando';
        
        // Resgata o nome do representante salvo no momento do login
        const representante = localStorage.getItem('representanteLogado') || 'Desconhecido';

        if (!cliente_nome) {
            alert("Por favor, preencha o Nome do Cliente antes de salvar.");
            return;
        }

        const dadosPedido = { cliente_nome, telefone, data_pedido, valor_total, status, representante };
        const urlParams = new URLSearchParams(window.location.search);
        const pedidoId = urlParams.get('id'); // Verifica se está editando

        try {
            const method = pedidoId ? 'PUT' : 'POST';
            const endpoint = pedidoId ? `/api/pedidos/${pedidoId}` : '/api/pedidos';

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPedido)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                window.location.href = 'historico.html'; // Redireciona para o histórico após salvar
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Erro ao comunicar com o servidor.");
        }
    });
}

// ==========================================
// 3. CARREGAR DADOS PARA EDIÇÃO (Se houver ID na URL)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    // Se estiver na tela de dashboard e tiver um ID na URL, busca os dados no banco
    if (pedidoId && document.getElementById('cliente_nome')) {
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}`);
            if (response.ok) {
                const pedido = await response.json();
                
                // Preenche os campos da tela com os dados do banco
                document.getElementById('cliente_nome').value = pedido.cliente_nome;
                document.getElementById('cliente_tel').value = pedido.telefone;
                document.getElementById('data_pedido').value = pedido.data_pedido;
                document.getElementById('val_total').value = pedido.valor_total;
                
                if (document.getElementById('status')) {
                    document.getElementById('status').value = pedido.status;
                }
            }
        } catch (error) {
            console.error("Erro ao carregar o pedido para edição:", error);
        }
    }
});

// ==========================================
// 4. LÓGICA DE LOGOUT (SAIR DO SISTEMA)
// ==========================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Limpa o nome do representante da memória e volta para o login
        localStorage.removeItem('representanteLogado');
        window.location.href = '/index.html'; 
    });
}

// ==========================================
// 5. CÁLCULOS MATEMÁTICOS DA FICHA (Mantenha os seus aqui)
// ==========================================
/* 
   Se você tiver funções antigas no seu app.js que faziam a soma automática 
   dos itens e das quantidades, você pode colar essas funções aqui embaixo.
*/