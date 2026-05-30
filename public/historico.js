document.addEventListener('DOMContentLoaded', carregarHistorico);

// Transformamos o carregamento em uma função para podermos chamar ela de novo após deletar um item
async function carregarHistorico() {
    const tbody = document.getElementById('historico-body');
    tbody.innerHTML = ''; // Limpa a tabela antes de preencher

    try {
        const response = await fetch('/api/pedidos');
        const pedidos = await response.json();

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum pedido salvo ainda.</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            const valorFormatado = pedido.valor_total ? pedido.valor_total.toFixed(2) : '0.00';
            const dataFormatada = pedido.data_pedido ? pedido.data_pedido.split('-').reverse().join('/') : '-';

            tr.innerHTML = `
                <td><strong># ${pedido.id}</strong></td>
                <td>${pedido.cliente_nome}</td>
                <td>${dataFormatada}</td>
                <td style="color: #27ae60; font-weight: bold;">R$ ${valorFormatado}</td>
                <td><span style="background: #f39c12; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">${pedido.status}</span></td>
                <td>
                    <a href="dashboard.html?id=${pedido.id}" style="background: #f1c40f; color: #333; padding: 5px 10px; text-decoration: none; border-radius: 5px; font-size: 12px; font-weight: bold; margin-right: 5px;">Editar</a>
                    
                    <button onclick="excluirPedido(${pedido.id})" style="background: #e74c3c; color: white; padding: 5px 10px; border: none; border-radius: 5px; font-size: 12px; font-weight: bold; cursor: pointer; width: auto; margin: 0;">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar o histórico.</td></tr>';
    }
}

// Lógica de Exclusão com aviso de segurança
async function excluirPedido(id) {
    const confirmacao = confirm(`Tem certeza que deseja EXCLUIR o pedido #${id}? Essa ação não tem volta.`);
    
    if (confirmacao) {
        try {
            const response = await fetch(`/api/pedidos/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                carregarHistorico(); // Atualiza a tabela na mesma hora, fazendo o item sumir da tela!
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert("Erro ao conectar com o servidor.");
        }
    }
}