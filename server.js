const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// 1. 30S API Endpoint
app.get('/api/history/30s', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: { 'Cache-Control': 'no-store' }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch 30S data' });
    }
});

// 2. 1M API Endpoint
app.get('/api/history/1m', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: { 'Cache-Control': 'no-store' }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch 1M data' });
    }
});

// 3. 3M API Endpoint (নতুন যোগ করা হলো)
app.get('/api/history/3m', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: { 'Cache-Control': 'no-store' }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch 3M data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
