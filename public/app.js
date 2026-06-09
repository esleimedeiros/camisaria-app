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
        if (!cliente_nome) {
            alert("Por favor, preencha o Nome do Cliente antes de salvar.");
            return;
        }

        const telefone = document.getElementById('cliente_tel')?.value || '';
        const data_pedido = document.getElementById('data_pedido')?.value || '';
        const data_entrega = document.getElementById('data_entrega')?.value || '';
        const num_pedido = document.getElementById('num_pedido')?.value || '';
        const cliente_end = document.getElementById('cliente_end')?.value || '';
        const valor_total = parseFloat(document.getElementById('val_total')?.value || 0) || 0;
        const status = document.getElementById('status')?.value || 'Aguardando';
        const representante = localStorage.getItem('representanteLogado') || 'Desconhecido';

        const detalhes = getDetalhesPedido();

        const dadosPedido = { cliente_nome, telefone, data_pedido, data_entrega, num_pedido, cliente_end, valor_total, status, representante, detalhes };
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

function getDetalhesPedido() {
    const fields = {
        compr_ml: document.getElementById('compr_ml')?.value || '',
        compr_mc: document.getElementById('compr_mc')?.value || '',
        colarinho: document.getElementById('colarinho')?.value || '',
        torax: document.getElementById('torax')?.value || '',
        cintura: document.getElementById('cintura')?.value || '',
        frauda: document.getElementById('frauda')?.value || '',
        punho_d: document.getElementById('punho_d')?.value || '',
        punho_e: document.getElementById('punho_e')?.value || '',
        biceps: document.getElementById('biceps')?.value || '',
        ombro: document.getElementById('ombro')?.value || '',
        antebraco: document.getElementById('antebraco')?.value || '',
        m_peito: document.getElementById('m_peito')?.value || '',
        modelagem: document.getElementById('modelagem')?.value || '',
        monograma: document.getElementById('monograma')?.value || '',
        checkboxes: {
            'COL. LISO': document.getElementById('check_col_liso')?.checked || false,
            'RECORTE RETO': document.getElementById('check_recorte_reto')?.checked || false,
            'COM BOTÃO': document.getElementById('check_com_botao')?.checked || false,
            'BOLSO RETO': document.getElementById('check_bolso_reto')?.checked || false,
            'F. LISA': document.getElementById('check_f_lisa')?.checked || false,
            'BOLSO MILITAR': document.getElementById('check_bolso_militar')?.checked || false,
            'P. MACHO': document.getElementById('check_p_macho')?.checked || false,
            'PREGA PALA': document.getElementById('check_prega_pala')?.checked || false,
            'COBERTA': document.getElementById('check_coberta')?.checked || false,
            'PENCES': document.getElementById('check_pences')?.checked || false,
            'RECORTE ITALIANO': document.getElementById('check_recorte_italiano')?.checked || false,
            'BOT. T. M.': document.getElementById('check_bot_t_m')?.checked || false,
            'PESPONTO FINO': document.getElementById('check_pesponto_fino')?.checked || false
        },
        itens: []
    };

    const rows = document.querySelectorAll('#itens-body tr');
    rows.forEach(row => {
        const itemDesc = row.querySelector('.item-desc')?.value || '';
        const itemQtd = row.querySelector('.item-qtd')?.value || '';
        const itemRefer = row.querySelector('.item-refer')?.value || '';
        const itemForn = row.querySelector('.item-forn')?.value || '';
        const itemValor = row.querySelector('.item-valor')?.value || '';
        const itemFinal = row.querySelector('.item-final')?.value || '';

        if (itemDesc || itemQtd || itemRefer || itemForn || itemValor || itemFinal) {
            fields.itens.push({
                itemDesc,
                itemQtd,
                itemRefer,
                itemForn,
                itemValor,
                itemFinal
            });
        }
    });

    return fields;
}

function setDetalhesPedido(detalhesData) {
    let detalhes = {};
    if (typeof detalhesData === 'string') {
        try {
            detalhes = JSON.parse(detalhesData);
        } catch (err) {
            console.warn('Detalhes JSON inválido:', err);
            return;
        }
    } else {
        detalhes = detalhesData || {};
    }

    document.getElementById('compr_ml').value = detalhes.compr_ml || '';
    document.getElementById('compr_mc').value = detalhes.compr_mc || '';
    document.getElementById('colarinho').value = detalhes.colarinho || '';
    document.getElementById('torax').value = detalhes.torax || '';
    document.getElementById('cintura').value = detalhes.cintura || '';
    document.getElementById('frauda').value = detalhes.frauda || '';
    document.getElementById('punho_d').value = detalhes.punho_d || '';
    document.getElementById('punho_e').value = detalhes.punho_e || '';
    document.getElementById('biceps').value = detalhes.biceps || '';
    document.getElementById('ombro').value = detalhes.ombro || '';
    document.getElementById('antebraco').value = detalhes.antebraco || '';
    document.getElementById('m_peito').value = detalhes.m_peito || '';
    document.getElementById('modelagem').value = detalhes.modelagem || '';
    document.getElementById('monograma').value = detalhes.monograma || '';

    if (detalhes.checkboxes) {
        Object.entries(detalhes.checkboxes).forEach(([label, checked]) => {
            const checkbox = document.querySelector(`input[type="checkbox"][value="${label}"]`);
            if (checkbox) checkbox.checked = Boolean(checked);
        });
    }

    if (Array.isArray(detalhes.itens) && detalhes.itens.length > 0) {
        const itensBody = document.getElementById('itens-body');
        itensBody.innerHTML = '';
        detalhes.itens.forEach(item => {
            const tr = document.createElement('tr');
            const cols = [
                { className: 'item-desc', type: 'text', value: item.itemDesc || '', placeholder: 'Item' },
                { className: 'item-qtd', type: 'number', value: item.itemQtd || '0', min: '0' },
                { className: 'item-refer', type: 'text', value: item.itemRefer || '' },
                { className: 'item-forn', type: 'text', value: item.itemForn || '' },
                { className: 'item-valor', type: 'number', value: item.itemValor || '0.00', min: '0', step: '0.01' },
                { className: 'item-final', type: 'number', value: item.itemFinal || '0.00', readonly: true, style: 'background:#e2e8f0; color:#333;' }
            ];

            cols.forEach(col => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = col.type;
                input.className = col.className;
                if (col.placeholder) input.placeholder = col.placeholder;
                input.value = col.value;
                if (col.min) input.min = col.min;
                if (col.step) input.step = col.step;
                if (col.readonly) input.readOnly = true;
                if (col.style) input.style = col.style;
                td.appendChild(input);
                tr.appendChild(td);
            });

            itensBody.appendChild(tr);
        });
    }
}

// ==========================================
// 3. CARREGAR DADOS PARA EDIÇÃO + CRIAR TABELA (Se houver ID na URL)
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
                
                document.getElementById('cliente_nome').value = pedido.cliente_nome || '';
                document.getElementById('cliente_tel').value = pedido.telefone || '';
                document.getElementById('data_pedido').value = pedido.data_pedido || '';
                document.getElementById('data_entrega').value = pedido.data_entrega || '';
                document.getElementById('num_pedido').value = pedido.num_pedido || '';
                document.getElementById('cliente_end').value = pedido.cliente_end || '';
                document.getElementById('val_total').value = pedido.valor_total || 0;
                document.getElementById('status').value = pedido.status || 'Aguardando';

                if (pedido.detalhes) {
                    setDetalhesPedido(pedido.detalhes);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar o pedido para edição:", error);
        }
    }

    // ==========================================
    // 5. LÓGICA DA TABELA E CÁLCULOS MATEMÁTICOS
    // ==========================================
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
// 4.1 LÓGICA DE IMPRESSÃO E EXPORTAÇÃO PDF
// ==========================================
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
                    allowTaint: true,
                    ignoreElements: (el) => {
                        // Ignorar elementos vazios nas labels
                        return el.classList && el.classList.contains('pdf-ignore');
                    }
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