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

    // Imprimir e Exportar PDF
    const printBtn = document.getElementById('print-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            const element = document.querySelector('.dashboard-container');
            if (!element) {
                alert('Área do pedido não encontrada para exportar.');
                return;
            }
            
            // Clonar o container para manipular sem afetar a página
            const elementClone = element.cloneNode(true);
            
            // Remover o header do clone para evitar sobreposição
            const headerClone = elementClone.querySelector('header');
            if (headerClone) {
                headerClone.remove();
            }
            
            // Remover botões de ação (imprimir, exportar) do clone
            const btnsPrint = elementClone.querySelectorAll('#print-btn, #export-pdf-btn, #logout-btn');
            btnsPrint.forEach(btn => btn.remove());
            
            // Aplicar classe de estilo PDF ao clone
            elementClone.classList.add('pdf-export');
            
            try {
                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: `pedido_${new Date().toISOString().slice(0,10)}_${Date.now()}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true, 
                        logging: false,
                        backgroundColor: '#0f172a',
                        allowTaint: true
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    }
                };
                
                html2pdf().set(opt).from(elementClone).save().catch(err => {
                    console.error('Erro ao gerar PDF:', err);
                    alert('Erro ao gerar PDF: ' + (err && err.message ? err.message : 'Erro desconhecido'));
                });
            } catch (err) {
                console.error('Erro:', err);
                alert('Erro ao gerar PDF: ' + (err && err.message ? err.message : err));
            }
        });
    }

}// ==========================================
// 5. LÓGICA DA TABELA E CÁLCULOS MATEMÁTICOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const itensBody = document.getElementById('itens-body');
    const inputTotal = document.getElementById('val_total');
    const inputSinal = document.getElementById('val_sinal');
    const inputSaldo = document.getElementById('val_saldo');

    // 5.1 Criar as linhas da tabela automaticamente (8 linhas vazias)
    if (itensBody && itensBody.children.length === 0) {
        for (let i = 1; i <= 8; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="item-desc" placeholder="Item ${i}"></td>
                <td><input type="number" class="item-qtd" min="0" value="0"></td>
                <td><input type="text" class="item-refer"></td>
                <td><input type="text" class="item-forn"></td>
                <td><input type="number" class="item-valor" min="0" step="0.01" value="0.00"></td>
                <td><input type="number" class="item-final" readonly value="0.00" style="background:#e2e8f0; color:#333;"></td>
            `;
            itensBody.appendChild(tr);
        }
    }

    // 5.2 Função que faz a matemática pesada
    function calcularTotais() {
        let totalGeral = 0;
        const linhas = document.querySelectorAll('#itens-body tr');

        // Multiplica a Quantidade pelo Valor Unitário de cada linha
        linhas.forEach(linha => {
            const qtd = parseFloat(linha.querySelector('.item-qtd').value) || 0;
            const valorUni = parseFloat(linha.querySelector('.item-valor').value) || 0;
            const inputFinal = linha.querySelector('.item-final');

            const subtotal = qtd * valorUni;
            inputFinal.value = subtotal.toFixed(2); // Atualiza o Valor Final da linha
            totalGeral += subtotal; // Soma no Total Geral
        });

        // Atualiza os campos de Total e Saldo lá embaixo
        if (inputTotal && inputSinal && inputSaldo) {
            inputTotal.value = totalGeral.toFixed(2);
            
            const sinal = parseFloat(inputSinal.value) || 0;
            const saldo = totalGeral - sinal;
            
            inputSaldo.value = saldo.toFixed(2);
        }
    }

    // 5.3 Fica "ouvindo" qualquer número que o usuário digitar na tabela para calcular na hora
    if (itensBody) {
        itensBody.addEventListener('input', calcularTotais);
    }
    
    // 5.4 Fica "ouvindo" se o usuário mudar o valor do SINAL para abater do SALDO
    if (inputSinal) {
        inputSinal.addEventListener('input', calcularTotais);
    }
});