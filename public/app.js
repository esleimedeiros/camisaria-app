// ==========================================
// --- LÓGICA DE LOGIN E CADASTRO ---
// ==========================================
const authForm = document.getElementById('auth-form');

if (authForm) {
    let isLogin = true;
    const toggleLink = document.getElementById('toggle-link');
    const accessCode = document.getElementById('access-code');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const messageEl = document.getElementById('message');

    toggleLink.addEventListener('click', () => {
        isLogin = !isLogin;
        formTitle.innerText = isLogin ? 'Acesso Restrito' : 'Novo Representante';
        submitBtn.innerText = isLogin ? 'Entrar' : 'Cadastrar';
        accessCode.style.display = isLogin ? 'none' : 'block';
        accessCode.required = !isLogin;
        toggleLink.innerText = isLogin ? 'Cadastre-se' : 'Faça login';
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const code = accessCode.value;

        const url = isLogin ? '/api/login' : '/api/register';
        const payload = isLogin ? { username, password } : { username, password, accessCode: code };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            messageEl.innerText = data.message || data.error;
            messageEl.style.color = res.ok ? 'green' : 'red';

            if (res.ok && isLogin) {
                setTimeout(() => window.location.href = '/dashboard.html', 1000);
            } else if (res.ok && !isLogin) {
                setTimeout(() => toggleLink.click(), 1500);
            }
        } catch (error) {
            messageEl.innerText = "Erro ao conectar com o servidor.";
            messageEl.style.color = 'red';
        }
    });
}

// ==========================================
// --- LÓGICA DO DASHBOARD E ORÇAMENTOS ---
// ==========================================
const itensBody = document.getElementById('itens-body');

if (itensBody) {
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoIdParaEditar = urlParams.get('id');

    if (pedidoIdParaEditar) {
        document.querySelector('h1').innerText = `Editando Pedido #${pedidoIdParaEditar}`;
        carregarDadosDoPedido(pedidoIdParaEditar);
    }

    // Carrega dados existentes e seleciona o status correto na tela
    async function carregarDadosDoPedido(id) {
        try {
            const res = await fetch(`/api/pedidos/${id}`);
            const pedido = await res.json();
            
            if (pedido) {
                document.getElementById('cliente_nome').value = pedido.cliente_nome || '';
                document.getElementById('cliente_tel').value = pedido.telefone || '';
                document.getElementById('data_pedido').value = pedido.data_pedido || '';
                document.getElementById('val_total').value = pedido.valor_total ? pedido.valor_total.toFixed(2) : '0.00';
                
                // Preenche o campo status com o valor salvo do banco de dados
                document.getElementById('status').value = pedido.status || 'Aguardando';
                
                calcularSaldo();
            }
        } catch (erro) {
            console.error("Erro ao carregar o pedido.");
        }
    }

    // Cria as linhas de A até H
    const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    letras.forEach(letra => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${letra}</strong></td>
            <td><input type="number" class="qtd" min="0" value="0"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="number" class="uni" step="0.01" value="0.00"></td>
            <td><input type="number" class="final" readonly value="0.00"></td>
        `;
        itensBody.appendChild(tr);

        tr.querySelector('.qtd').addEventListener('input', calcularTotais);
        tr.querySelector('.uni').addEventListener('input', calcularTotais);
    });

    function calcularTotais() {
        let totalGeral = 0;
        document.querySelectorAll('#itens-body tr').forEach(row => {
            const qtd = parseFloat(row.querySelector('.qtd').value) || 0;
            const uni = parseFloat(row.querySelector('.uni').value) || 0;
            const final = qtd * uni;
            row.querySelector('.final').value = final.toFixed(2);
            totalGeral += final;
        });

        document.getElementById('val_total').value = totalGeral.toFixed(2);
        calcularSaldo();
    }

    function calcularSaldo() {
        const total = parseFloat(document.getElementById('val_total').value) || 0;
        const sinal = parseFloat(document.getElementById('val_sinal').value) || 0;
        document.getElementById('val_saldo').value = (total - sinal).toFixed(2);
    }

    document.getElementById('val_sinal').addEventListener('input', calcularSaldo);

    document.getElementById('logout-btn').addEventListener('click', () => {
        window.location.href = '/';
    });

    // Envio dos dados incluindo o status
    const imprimirBtn = document.getElementById('imprimir-btn');
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', async () => {
            const cliente_nome = document.getElementById('cliente_nome').value;
            const telefone = document.getElementById('cliente_tel').value;
            const data_pedido = document.getElementById('data_pedido').value;
            const valor_total = parseFloat(document.getElementById('val_total').value) || 0;
            const status = document.getElementById('status').value; // Lê o valor do status selecionado

            if (!cliente_nome) {
                alert("Por favor, preencha o Nome do Cliente antes de salvar.");
                return;
            }

            const dadosPedido = { cliente_nome, telefone, data_pedido, valor_total, status };

            const url = pedidoIdParaEditar ? `/api/pedidos/${pedidoIdParaEditar}` : '/api/pedidos';
            const method = pedidoIdParaEditar ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosPedido)
                });

                const data = await res.json();

                if (res.ok) {
                    alert(`Sucesso! ${data.message}`);
                    window.print();
                } else {
                    alert(`Erro: ${data.error}`);
                }
            } catch (erro) {
                alert("Erro de conexão com o servidor.");
            }
        });
    }
}