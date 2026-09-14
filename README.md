# 👔 Sistema de Gestão de Orçamentos e Pedidos

Um sistema web completo, leve e responsivo desenvolvido para a criação, gestão e armazenamento de orçamentos e pedidos sob medida. 

A aplicação permite o cadastro de clientes, registro detalhado de medidas, configuração de peças (com checkboxes automáticos), cálculo de sinais/saldos e geração de PDFs formatados para impressão em folha A4.

## 🚀 Funcionalidades

- **Autenticação de Representantes:** Acesso restrito via login e senha (com código de segurança para novos cadastros).
- **Criação de Orçamentos:** Formulário completo com mais de 15 campos de medidas corporais e detalhes de modelagem.
- **Tabela de Itens Dinâmica:** Inserção de quantidade, referência, fornecedor, cor, metros e observações, com cálculo automático de subtotal, total, sinal e saldo.
- **Exportação Profissional:** Botão dedicado para gerar o orçamento em PDF, ocultando menus e formatando a página perfeitamente para impressão.
- **Histórico e Filtros:** Tela de gestão com pesquisa em tempo real por nome do cliente, número do pedido ou data.
- **Responsividade:** Interface 100% adaptada para uso mobile, permitindo rolagem horizontal suave nas tabelas sem quebrar o layout.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (sem frameworks pesados para máxima performance).
- **Backend:** Node.js com Express.
- **Banco de Dados:** SQLite (banco de dados em arquivo único, rápido e otimizado).
- **Hospedagem:** Preparado para deploy no [Render](https://render.com), com suporte para discos persistentes (`Render Disks`) garantindo a integridade do banco de dados em reinicializações.

## 💻 Como rodar o projeto localmente

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git](https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git)