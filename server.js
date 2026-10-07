const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// মেমোরিতে ডেটা স্টোর করার জন্য
let latestHistoryData = {
    '30s': [],
    '1m': []
};

// ব্রাউজার বা অন্য কোনো ক্লায়েন্টকে ডেটা দেখানোর জন্য API Endpoint
app.get('/api/history/:type', (req, res) => {
    const type = req.params.type.toLowerCase();
    if (latestHistoryData[type]) {
        res.json({
            success: true,
            total: latestHistoryData[type].length,
            data: latestHistoryData[type]
        });
    } else {
        res.status(404).json({ success: false, message: 'Type not found' });
    }
});

// সার্ভার নিজেই থার্ড-পার্টি এপিআই থেকে ডেটা ফেচ করে প্রক্সি করবে (CORS সমস্যা দূর করতে)
app.get('/proxy/:type', async (req, res) => {
    const type = req.params.type.toLowerCase();
    let urlKey = type === '30s' ? '30S' : '1M';
    
    try {
        const response = await fetch(`https://draw.ar-lottery01.com/WinGo/WinGo_${urlKey}/GetHistoryIssuePage.json?ts=` + Date.now(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok) throw new Error('API fetch failed');
        const rawData = await response.json();

        if (rawData && rawData.data && Array.isArray(rawData.data.list)) {
            const list = rawData.data.list.slice(0, 10);
            
            // আপনার কাঙ্ক্ষিত ফরম্যাটে ডেটা প্রসেস করা
            const formattedList = list.map(item => {
                const num = Number.parseInt(item.number, 10);
                const size = num >= 5 ? "Big" : "Small";
                let color = 'green';
                if ([2, 4, 6, 8].includes(num)) color = "red";
                else if (num === 0 || num === 5) color = num === 0 ? "red,violet" : "green,violet";

                return {
                    Period: String(item.issueNumber ?? ""),
                    Number: num,
                    Size: size,
                    Colour: color,
                    Time: new Date().toLocaleTimeString()
                };
            });

            // সার্ভারে সেভ করে রাখা হলো
            latestHistoryData[type] = formattedList;

            return res.json({ success: true, data: { list: list } });
        }
        throw new Error('Invalid structure');
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
