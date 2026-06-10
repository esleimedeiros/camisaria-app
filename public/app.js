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

        const telefone = document.getElementById('cliente_tel') ? document.getElementById('cliente_tel').value : '';
        const cliente_end = document.getElementById('cliente_end') ? document.getElementById('cliente_end').value : '';
        const data_pedido = document.getElementById('data_pedido') ? document.getElementById('data_pedido').value : '';
        const data_entrega = document.getElementById('data_entrega') ? document.getElementById('data_entrega').value : '';
        const num_pedido = document.getElementById('num_pedido') ? document.getElementById('num_pedido').value : '';
        const status = document.getElementById('status') ? document.getElementById('status').value : 'Aguardando';
        const valor_total = document.getElementById('val_total') ? parseFloat(document.getElementById('val_total').value) || 0 : 0;
        
        // RECUPERA SINAL E SALDO
        const sinal = document.getElementById('val_sinal') ? parseFloat(document.getElementById('val_sinal').value) || 0 : 0;
        const saldo = document.getElementById('val_saldo') ? parseFloat(document.getElementById('val_saldo').value) || 0 : 0;
        
        const representante = localStorage.getItem('representanteLogado') || 'Desconhecido';

        const itensDetalhados = [];
        const linhas = document.querySelectorAll('#itens-body tr');
        linhas.forEach(linha => {
            const desc = linha.querySelector('.item-desc').value;
            const qtd = parseFloat(linha.querySelector('.item-qtd').value) || 0;
            if (desc || qtd > 0) { 
                itensDetalhados.push({
                    desc: desc, qtd: qtd,
                    refer: linha.querySelector('.item-refer').value,
                    forn: linha.querySelector('.item-forn').value,
                    valor_uni: linha.querySelector('.item-valor').value,
                    valor_final: linha.querySelector('.item-final').value
                });
            }
        });

        const medidas = {
            compr_ml: document.getElementById('med_compr_ml') ? document.getElementById('med_compr_ml').value : '',
            compr_mc: document.getElementById('med_compr_mc') ? document.getElementById('med_compr_mc').value : '',
            colarinho: document.getElementById('med_colarinho') ? document.getElementById('med_colarinho').value : '',
            torax: document.getElementById('med_torax') ? document.getElementById('med_torax').value : '',
            cintura: document.getElementById('med_cintura') ? document.getElementById('med_cintura').value : '',
            frauda: document.getElementById('med_frauda') ? document.getElementById('med_frauda').value : '',
            punho_d: document.getElementById('med_punho_d') ? document.getElementById('med_punho_d').value : '',
            punho_e: document.getElementById('med_punho_e') ? document.getElementById('med_punho_e').value : '',
            biceps: document.getElementById('med_biceps') ? document.getElementById('med_biceps').value : '',
            ombro: document.getElementById('med_ombro') ? document.getElementById('med_ombro').value : '',
            antebraco: document.getElementById('med_antebraco') ? document.getElementById('med_antebraco').value : '',
            m_peito: document.getElementById('med_m_peito') ? document.getElementById('med_m_peito').value : '',
            modelagem: document.getElementById('med_modelagem') ? document.getElementById('med_modelagem').value : '',
            monograma: document.getElementById('med_monograma') ? document.getElementById('med_monograma').value : '',
            
            chk_col_liso: document.getElementById('chk_col_liso') ? document.getElementById('chk_col_liso').checked : false,
            chk_recorte_reto: document.getElementById('chk_recorte_reto') ? document.getElementById('chk_recorte_reto').checked : false,
            chk_com_botao: document.getElementById('chk_com_botao') ? document.getElementById('chk_com_botao').checked : false,
            chk_bolso_reto: document.getElementById('chk_bolso_reto') ? document.getElementById('chk_bolso_reto').checked : false,
            chk_f_lisa: document.getElementById('chk_f_lisa') ? document.getElementById('chk_f_lisa').checked : false,
            chk_bolso_militar: document.getElementById('chk_bolso_militar') ? document.getElementById('chk_bolso_militar').checked : false,
            chk_p_macho: document.getElementById('chk_p_macho') ? document.getElementById('chk_p_macho').checked : false,
            chk_prega_pala: document.getElementById('chk_prega_pala') ? document.getElementById('chk_prega_pala').checked : false,
            chk_coberta: document.getElementById('chk_coberta') ? document.getElementById('chk_coberta').checked : false,
            chk_pences: document.getElementById('chk_pences') ? document.getElementById('chk_pences').checked : false,
            chk_recorte_italiano: document.getElementById('chk_recorte_italiano') ? document.getElementById('chk_recorte_italiano').checked : false,
            chk_bot_tm: document.getElementById('chk_bot_tm') ? document.getElementById('chk_bot_tm').checked : false,
            chk_pesponto_fino: document.getElementById('chk_pesponto_fino') ? document.getElementById('chk_pesponto_fino').checked : false
        };

        const dadosPedido = { 
            cliente_nome, telefone, cliente_end, data_pedido, data_entrega, 
            num_pedido, valor_total, sinal, saldo, status, representante, detalhes: itensDetalhados, medidas 
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
// 3. LÓGICA DA TABELA
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

// ==========================================
// 4. CARREGAR DADOS PARA EDIÇÃO 
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
                
                // RECARREGA SINAL E SALDO
                if (document.getElementById('val_sinal')) document.getElementById('val_sinal').value = pedido.sinal || 0;
                if (document.getElementById('val_saldo')) document.getElementById('val_saldo').value = pedido.saldo || 0;

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

                if (pedido.medidas) {
                    const med = JSON.parse(pedido.medidas);
                    if (document.getElementById('med_compr_ml')) document.getElementById('med_compr_ml').value = med.compr_ml || '';
                    if (document.getElementById('med_compr_mc')) document.getElementById('med_compr_mc').value = med.compr_mc || '';
                    if (document.getElementById('med_colarinho')) document.getElementById('med_colarinho').value = med.colarinho || '';
                    if (document.getElementById('med_torax')) document.getElementById('med_torax').value = med.torax || '';
                    if (document.getElementById('med_cintura')) document.getElementById('med_cintura').value = med.cintura || '';
                    if (document.getElementById('med_frauda')) document.getElementById('med_frauda').value = med.frauda || '';
                    if (document.getElementById('med_punho_d')) document.getElementById('med_punho_d').value = med.punho_d || '';
                    if (document.getElementById('med_punho_e')) document.getElementById('med_punho_e').value = med.punho_e || '';
                    if (document.getElementById('med_biceps')) document.getElementById('med_biceps').value = med.biceps || '';
                    if (document.getElementById('med_ombro')) document.getElementById('med_ombro').value = med.ombro || '';
                    if (document.getElementById('med_antebraco')) document.getElementById('med_antebraco').value = med.antebraco || '';
                    if (document.getElementById('med_m_peito')) document.getElementById('med_m_peito').value = med.m_peito || '';
                    if (document.getElementById('med_modelagem')) document.getElementById('med_modelagem').value = med.modelagem || '';
                    if (document.getElementById('med_monograma')) document.getElementById('med_monograma').value = med.monograma || '';

                    if (document.getElementById('chk_col_liso')) document.getElementById('chk_col_liso').checked = med.chk_col_liso || false;
                    if (document.getElementById('chk_recorte_reto')) document.getElementById('chk_recorte_reto').checked = med.chk_recorte_reto || false;
                    if (document.getElementById('chk_com_botao')) document.getElementById('chk_com_botao').checked = med.chk_com_botao || false;
                    if (document.getElementById('chk_bolso_reto')) document.getElementById('chk_bolso_reto').checked = med.chk_bolso_reto || false;
                    if (document.getElementById('chk_f_lisa')) document.getElementById('chk_f_lisa').checked = med.chk_f_lisa || false;
                    if (document.getElementById('chk_bolso_militar')) document.getElementById('chk_bolso_militar').checked = med.chk_bolso_militar || false;
                    if (document.getElementById('chk_p_macho')) document.getElementById('chk_p_macho').checked = med.chk_p_macho || false;
                    if (document.getElementById('chk_prega_pala')) document.getElementById('chk_prega_pala').checked = med.chk_prega_pala || false;
                    if (document.getElementById('chk_coberta')) document.getElementById('chk_coberta').checked = med.chk_coberta || false;
                    if (document.getElementById('chk_pences')) document.getElementById('chk_pences').checked = med.chk_pences || false;
                    if (document.getElementById('chk_recorte_italiano')) document.getElementById('chk_recorte_italiano').checked = med.chk_recorte_italiano || false;
                    if (document.getElementById('chk_bot_tm')) document.getElementById('chk_bot_tm').checked = med.chk_bot_tm || false;
                    if (document.getElementById('chk_pesponto_fino')) document.getElementById('chk_pesponto_fino').checked = med.chk_pesponto_fino || false;
                }
            }
        } catch (error) {
            console.error("Erro ao carregar o pedido:", error);
        }
    }
});

// ==========================================
// 5. LÓGICA DE LOGOUT
// ==========================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('representanteLogado');
        window.location.href = '/index.html'; 
    });
}