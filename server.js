const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    console.log('Banco de dados conectado.');
});

// Criação das Tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_nome TEXT,
        telefone TEXT,
        data_pedido TEXT,
        data_entrega TEXT,
        num_pedido TEXT,
        cliente_end TEXT,
        valor_total REAL,
        status TEXT DEFAULT 'Aguardando',
        representante TEXT,
        detalhes TEXT
    )`);

    // Atualização automática de colunas se não existirem
    db.all(`PRAGMA table_info(pedidos)`, [], (err, rows) => {
        if (err) return console.error(err.message);
        const columns = rows.map(row => row.name);
        if (!columns.includes('data_entrega')) db.run(`ALTER TABLE pedidos ADD COLUMN data_entrega TEXT`);
        if (!columns.includes('num_pedido')) db.run(`ALTER TABLE pedidos ADD COLUMN num_pedido TEXT`);
        if (!columns.includes('cliente_end')) db.run(`ALTER TABLE pedidos ADD COLUMN cliente_end TEXT`);
        if (!columns.includes('detalhes')) db.run(`ALTER TABLE pedidos ADD COLUMN detalhes TEXT`);
    });
});

// Rota de Registro Segura
app.post('/api/register', (req, res) => {
    const { username, password, accessCode } = req.body;
    const serverAccessCode = process.env.ACCESS_CODE || 'CAMISARIA@2026.*';
    
    if (accessCode !== serverAccessCode) return res.status(401).json({ error: 'Código inválido.' });

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
        if (err) return res.status(400).json({ error: 'Usuário já existe.' });
        res.json({ message: 'Representante cadastrado com sucesso! Faça login.' });
    });
});

// Rota de Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (row) res.json({ message: 'Acesso liberado!', username: row.username });
        else res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    });
});

// Salvar Pedido
app.post('/api/pedidos', (req, res) => {
    const { cliente_nome, telefone, data_pedido, data_entrega, num_pedido, cliente_end, valor_total, status, representante, detalhes } = req.body;
    if (!cliente_nome) return res.status(400).json({ error: 'O nome do cliente é obrigatório.' });

    const query = `INSERT INTO pedidos (cliente_nome, telefone, data_pedido, data_entrega, num_pedido, cliente_end, valor_total, status, representante, detalhes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const detalhesJson = detalhes ? JSON.stringify(detalhes) : null;
    
    db.run(query, [cliente_nome, telefone, data_pedido, data_entrega, num_pedido, cliente_end, valor_total, status || 'Aguardando', representante || 'Não informado', detalhesJson], function(err) {
        if (err) {
            console.error("Erro ao salvar:", err.message);
            return res.status(500).json({ error: 'Erro interno ao salvar.' });
        }
        res.json({ message: 'Orçamento salvo com sucesso!', pedidoId: this.lastID });
    });
});

// Buscar todos os pedidos (Limite de 100 para não travar o celular)
app.get('/api/pedidos', (req, res) => {
    db.all(`SELECT * FROM pedidos ORDER BY id DESC LIMIT 100`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
        res.json(rows);
    });
});

// Buscar um pedido específico
app.get('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM pedidos WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro no banco.' });
        if (!row) return res.status(404).json({ error: 'Pedido não encontrado.' });
        res.json(row);
    });
});

// Atualizar pedido
app.put('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const { cliente_nome, telefone, data_pedido, data_entrega, num_pedido, cliente_end, valor_total, status, detalhes } = req.body;
    const detalhesJson = detalhes ? JSON.stringify(detalhes) : null;

    const query = `UPDATE pedidos SET cliente_nome = ?, telefone = ?, data_pedido = ?, data_entrega = ?, num_pedido = ?, cliente_end = ?, valor_total = ?, status = ?, detalhes = ? WHERE id = ?`;
    db.run(query, [cliente_nome, telefone, data_pedido, data_entrega, num_pedido, cliente_end, valor_total, status, detalhesJson, id], function(err) {
        if (err) {
            console.error("Erro ao atualizar:", err.message);
            return res.status(500).json({ error: 'Erro ao atualizar.' });
        }
        res.json({ message: 'Orçamento atualizado com sucesso!', pedidoId: id });
    });
});

// Excluir pedido
app.delete('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM pedidos WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao excluir o pedido.' });
        res.json({ message: 'Pedido excluído.' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sistema rodando na porta ${PORT}!`);
});