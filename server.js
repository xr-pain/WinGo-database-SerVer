const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// কমন হেডার যা এক্সটার্নাল সার্ভারকে বোঝাবে এটি ব্রাউজার থেকে রিকোয়েস্ট
const customHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://ar-lottery01.com/',
    'Cache-Control': 'no-store'
};

// 1. 30S API Endpoint
app.get('/api/history/30s', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: customHeaders
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch 30S data', details: error.message });
    }
});

// 2. 1M API Endpoint
app.get('/api/history/1m', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: customHeaders
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch 1M data', details: error.message });
    }
});

// 3. 3M API Endpoint
app.get('/api/history/3m', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: customHeaders
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch 3M data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
