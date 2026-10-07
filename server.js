const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// 1. 30S API Endpoint with Fallback/Error Handling
app.get('/api/history/30s', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: { 'Cache-Control': 'no-store', 'User-Agent': 'Mozilla/5.0' }
        });
        if (!response.ok) throw new Error('External API error');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // যদি এক্সটার্নাল এপিআই ডাউন থাকে, তবে একটি ফাকা বা সেফ স্ট্রাকচার রিটার্ন করবে যাতে পেজ ক্র্যাশ না করে
        res.status(500).json({ 
            error: 'Failed to fetch 30S data',
            details: error.message,
            data: { list: [] } 
        });
    }
});

// 2. 1M API Endpoint
app.get('/api/history/1m', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: { 'Cache-Control': 'no-store', 'User-Agent': 'Mozilla/5.0' }
        });
        if (!response.ok) throw new Error('External API error');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch 1M data',
            details: error.message,
            data: { list: [] } 
        });
    }
});

// 3. 3M API Endpoint
app.get('/api/history/3m', async (req, res) => {
    try {
        const response = await fetch('https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json?ts=' + Date.now(), {
            headers: { 'Cache-Control': 'no-store', 'User-Agent': 'Mozilla/5.0' }
        });
        if (!response.ok) throw new Error('External API error');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch 3M data',
            details: error.message,
            data: { list: [] } 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
