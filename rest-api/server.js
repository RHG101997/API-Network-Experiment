const express = require('express');
const cors = require('cors');
const { getDatabase } = require('../database/simple-db');

const app = express();
const PORT = 3001;
const db = getDatabase();

app.use(cors());
app.use(express.json());

app.post('/users', (req, res) => {
    try {
        const { name, email } = req.body;
        const user = db.createUser(name, email);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const user = db.getUser(parseInt(id));
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products', (req, res) => {
    try {
        const { category, limit = 10, offset = 0 } = req.query;
        const products = db.getProducts(category, parseInt(limit), parseInt(offset));
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/orders', (req, res) => {
    try {
        const { user_id, items } = req.body;
        const order = db.createOrder(parseInt(user_id), items);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/users/:id/orders', (req, res) => {
    try {
        const { id } = req.params;
        const orders = db.getUserOrders(parseInt(id));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`REST API server running on http://localhost:${PORT}`);
});