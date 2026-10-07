const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let latestHistoryData = {
    '30s': [],
    '1m': []
};

// রিয়েল ডেটা পাওয়ার জন্য API Endpoint
app.get('/api/history/:type', (req, res) => {
    const type = req.params.type.toLowerCase();
    if (latestHistoryData[type] && latestHistoryData[type].length > 0) {
        res.json({ success: true, data: latestHistoryData[type] });
    } else {
        res.status(404).json({ success: false, message: 'No real data fetched yet or API blocked.' });
    }
});

// প্রক্সি রাউট যা শুধু রিয়েল এপিআই থেকে ডেটা আনবে
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

        if (!response.ok) {
            throw new Error(`API fetch failed with status: ${response.status}`);
        }
        
        const rawData = await response.json();

        if (!rawData || !rawData.data || !Array.isArray(rawData.data.list)) {
            throw new Error('Invalid structure from target API');
        }

        const rawList = rawData.data.list.slice(0, 10);

        const formattedList = rawList.map(item => {
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

        latestHistoryData[type] = formattedList;
        res.json({ success: true, data: { list: formattedList } });

    } catch (error) {
        // কোনো ফেক ডেটা দেওয়া হবে না, সরাসরি রিয়েল এরর রিটার্ন করবে
        res.status(500).json({ 
            success: false, 
            error: error.message,
            message: "Real API failed or IP is blocked." 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
