const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Custom API Endpoint for 30S History
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

// Custom API Endpoint for 1M History
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
