// ==========================================
// 1. LÓGICA DE AUTENTICAÇÃO E ALTERNÂNCIA DE TELA
// ==========================================
const authForm = document.getElementById('auth-form');
const toggleLink = document.getElementById('toggle-link');
const accessCodeInput = document.getElementById('access-code'); 
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

let isLoginMode = true; // Variável para saber se estamos no login ou cadastro

// Lógica que faz a alternância entre Login e Cadastro
if (toggleLink) {
    toggleLink.addEventListener('click', () => {
        isLoginMode = !isLoginMode; // Inverte o modo atual

        if (isLoginMode) {
            // Volta para a tela de Login
            formTitle.textContent = "Acesso Restrito";
            submitBtn.textContent = "Entrar";
            if(accessCodeInput) {
                accessCodeInput.style.display = "none";
                accessCodeInput.removeAttribute('required');
            }
            toggleLink.textContent = "Cadastre-se";
            document.querySelector('.toggle-text').childNodes[0].nodeValue = "Primeiro acesso? ";
        } else {
            // Vai para a tela de Cadastro
            formTitle.textContent = "Novo Cadastro";
            submitBtn.textContent = "Cadastrar";
            if(accessCodeInput) {
                accessCodeInput.style.display = "block";
                accessCodeInput.setAttribute('required', 'true');
            }
            toggleLink.textContent = "Voltar para o Login";
            document.querySelector('.toggle-text').childNodes[0].nodeValue = "Já tem uma conta? ";
        }
    });
}

// Lógica de envio das informações (Login ou Cadastro)
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const accessCode = accessCodeInput ? accessCodeInput.value : null;
        
        const endpoint = isLoginMode ? '/api/login' : '/api/register';
        const body = isLoginMode ? { username, password } : { username, password, accessCode };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            
            if (res.ok && isLoginMode) {
                alert(data.message);
                // Salva o nome na memória e entra
                localStorage.setItem('representanteLogado', data.username);
                window.location.href = '/dashboard.html';
            } else if (res.ok && !isLoginMode) {
                alert(data.message);
                // Se o cadastro der certo, limpa o formulário e volta para a tela de login
                authForm.reset();
                toggleLink.click();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor.');
        }
    });
}

// ==========================================
// 2. LÓGICA DE SALVAR/ATUALIZAR O PEDIDO NO BANCO
// ==========================================
const imprimirBtn = document.getElementById('imprimir-btn');
if (imprimirBtn) {
    imprimirBtn.addEventListener('click', async () => {
        const cliente_nome = document.getElementById('cliente_nome').value;
        
        // Verifica se os campos existem antes de pegar o valor para evitar erros
        const telElement = document.getElementById('cliente_tel');
        const telefone = telElement ? telElement.value : '';
        
        const dataElement = document.getElementById('data_pedido');
        const data_pedido = dataElement ? dataElement.value : '';
        
        const valTotalElement = document.getElementById('val_total');
        const valor_total = valTotalElement ? parseFloat(valTotalElement.value) || 0 : 0;
        
        const statusElement = document.getElementById('status');
        const status = statusElement ? statusElement.value : 'Aguardando';
        
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
                
                if (document.getElementById('cliente_tel')) {
                    document.getElementById('cliente_tel').value = pedido.telefone;
                }
                if (document.getElementById('data_pedido')) {
                    document.getElementById('data_pedido').value = pedido.data_pedido;
                }
                if (document.getElementById('val_total')) {
                    document.getElementById('val_total').value = pedido.valor_total;
                }
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