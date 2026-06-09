// ==========================================
// 1. LÓGICA DE AUTENTICAÇÃO E ALTERNÂNCIA DE TELA
// ==========================================
const authForm = document.getElementById('auth-form');
const toggleLink = document.getElementById('toggle-link');
const accessCodeInput = document.getElementById('access-code'); 
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

let isLoginMode = true; 

if (toggleLink) {
    toggleLink.addEventListener('click', () => {
        isLoginMode = !isLoginMode; 
        if (isLoginMode) {
            formTitle.textContent = "Acesso Restrito";
            submitBtn.textContent = "Entrar";
            if(accessCodeInput) { accessCodeInput.style.display = "none"; accessCodeInput.removeAttribute('required'); }
            toggleLink.textContent = "Cadastre-se";
            document.querySelector('.toggle-text').childNodes[0].nodeValue = "Primeiro acesso? ";
        } else {
            formTitle.textContent = "Novo Cadastro";
            submitBtn.textContent = "Cadastrar";
            if(accessCodeInput) { accessCodeInput.style.display = "block"; accessCodeInput.setAttribute('required', 'true'); }
            toggleLink.textContent = "Voltar para o Login";
            document.querySelector('.toggle-text').childNodes[0].nodeValue = "Já tem uma conta? ";
        }
    });
}

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const accessCode = accessCodeInput ? accessCodeInput.value : null;
        
        const endpoint = isLoginMode ? '/api/login' : '/api/register';
        const body = isLoginMode ? { username, password } : { username, password, accessCode };

        try {
            const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            
            if (res.ok && isLoginMode) {
                alert(data.message);
                localStorage.setItem('representanteLogado', data.username);
                window.location.href = '/dashboard.html';
            } else if (res.ok && !isLoginMode) {
                alert(data.message);
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
        if (!cliente_nome) {
            alert("Por favor, preencha o Nome do Cliente antes de salvar.");
            return;
        }

        // Pega todos os campos novos
        const telefone = document.getElementById('cliente_tel') ? document.getElementById('cliente_tel').value : '';
        const cliente_end = document.getElementById('cliente_end') ? document.getElementById('cliente_end').value : '';
        const data_pedido = document.getElementById('data_pedido') ? document.getElementById('data_pedido').value : '';
        const data_entrega = document.getElementById('data_entrega') ? document.getElementById('data_entrega').value : '';
        const num_pedido = document.getElementById('num_pedido') ? document.getElementById('num_pedido').value : '';
        const status = document.getElementById('status') ? document.getElementById('status').value : 'Aguardando';
        const valor_total = document.getElementById('val_total') ? parseFloat(document.getElementById('val_total').value) || 0 : 0;
        
        const representante = localStorage.getItem('representanteLogado') || 'Desconhecido';

        // MÁGICA: Varre a tabela para pegar os itens preenchidos e salvar em 'detalhes'
        const itensDetalhados = [];
        const linhas = document.querySelectorAll('#itens-body tr');
        linhas.forEach(linha => {
            const desc = linha.querySelector('.item-desc').value;
            const qtd = linha.querySelector('.item-qtd').value;
            if (desc || qtd > 0) { // Salva a linha só se tiver descrição ou quantidade
                itensDetalhados.push({
                    desc: desc,
                    qtd: qtd,
                    refer: linha.querySelector('.item-refer').value,
                    forn: linha.querySelector('.item-forn').value,
                    valor_uni: linha.querySelector('.item-valor').value,
                    valor_final: linha.querySelector('.item-final').value
                });
            }
        });

        // Monta o pacote de dados completo para enviar ao backend
        const dadosPedido = { 
            cliente_nome, telefone, cliente_end, data_pedido, data_entrega, 
            num_pedido, valor_total, status, representante, detalhes: itensDetalhados 
        };

        const urlParams = new URLSearchParams(window.location.search);
        const pedidoId = urlParams.get('id');

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
                window.location.href = 'historico.html';
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

    if (pedidoId && document.getElementById('cliente_nome')) {
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}`);
            if (response.ok) {
                const pedido = await response.json();
                
                document.getElementById('cliente_nome').value = pedido.cliente_nome || '';
                if (document.getElementById('cliente_tel')) document.getElementById('cliente_tel').value = pedido.telefone || '';
                if (document.getElementById('cliente_end')) document.getElementById('cliente_end').value = pedido.cliente_end || '';
                if (document.getElementById('data_pedido')) document.getElementById('data_pedido').value = pedido.data_pedido || '';
                if (document.getElementById('data_entrega')) document.getElementById('data_entrega').value = pedido.data_entrega || '';
                if (document.getElementById('num_pedido')) document.getElementById('num_pedido').value = pedido.num_pedido || '';
                if (document.getElementById('val_total')) document.getElementById('val_total').value = pedido.valor_total || '';
                if (document.getElementById('status')) document.getElementById('status').value = pedido.status || '';

                // Recarrega os detalhes da tabela se existirem
                if (pedido.detalhes) {
                    const itens = JSON.parse(pedido.detalhes);
                    const linhas = document.querySelectorAll('#itens-body tr');
                    itens.forEach((item, index) => {
                        if(linhas[index]) {
                            linhas[index].querySelector('.item-desc').value = item.desc || '';
                            linhas[index].querySelector('.item-qtd').value = item.qtd || 0;
                            linhas[index].querySelector('.item-refer').value = item.refer || '';
                            linhas[index].querySelector('.item-forn').value = item.forn || '';
                            linhas[index].querySelector('.item-valor').value = item.valor_uni || 0;
                            linhas[index].querySelector('.item-final').value = item.valor_final || 0;
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao carregar o pedido:", error);
        }
    }
});

// ==========================================
// 4. LÓGICA DE LOGOUT
// ==========================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('representanteLogado');
        window.location.href = '/index.html'; 
    });
}

// ==========================================
// 5. LÓGICA DA TABELA E CÁLCULOS MATEMÁTICOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const itensBody = document.getElementById('itens-body');
    const inputTotal = document.getElementById('val_total');
    const inputSinal = document.getElementById('val_sinal');
    const inputSaldo = document.getElementById('val_saldo');

    if (itensBody && itensBody.children.length === 0) {
        for (let i = 1; i <= 8; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="item-desc" placeholder="Item ${i}"></td>
                <td><input type="number" class="item-qtd" min="0" value="0"></td>
                <td><input type="text" class="item-refer"></td>
                <td><input type="text" class="item-forn"></td>
                <td><input type="number" class="item-valor" min="0" step="0.01" value="0.00"></td>
                <td><input type="number" class="item-final" readonly value="0.00" style="background:rgba(0,0,0,0.2); color:white;"></td>
            `;
            itensBody.appendChild(tr);
        }
    }

    function calcularTotais() {
        let totalGeral = 0;
        const linhas = document.querySelectorAll('#itens-body tr');

        linhas.forEach(linha => {
            const qtd = parseFloat(linha.querySelector('.item-qtd').value) || 0;
            const valorUni = parseFloat(linha.querySelector('.item-valor').value) || 0;
            const inputFinal = linha.querySelector('.item-final');

            const subtotal = qtd * valorUni;
            inputFinal.value = subtotal.toFixed(2);
            totalGeral += subtotal;
        });

        if (inputTotal && inputSinal && inputSaldo) {
            inputTotal.value = totalGeral.toFixed(2);
            const sinal = parseFloat(inputSinal.value) || 0;
            const saldo = totalGeral - sinal;
            inputSaldo.value = saldo.toFixed(2);
        }
    }

    if (itensBody) itensBody.addEventListener('input', calcularTotais);
    if (inputSinal) inputSinal.addEventListener('input', calcularTotais);
});