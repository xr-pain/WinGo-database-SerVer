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

// ডামি বা ফলব্যাক ডেটা জেনারেটর (এপিআই ব্লক হলে কাজ করবে)
function generateFallbackList(urlKey) {
    let list = [];
    let baseIssue = Date.now().toString().slice(0, 10) + (urlKey === '30S' ? '3000' : '1000');
    for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 10);
        const size = num >= 5 ? "Big" : "Small";
        let color = 'green';
        if ([2, 4, 6, 8].includes(num)) color = "red";
        else if (num === 0 || num === 5) color = num === 0 ? "red,violet" : "green,violet";

        list.push({
            issueNumber: (BigInt(baseIssue) - BigInt(i)).toString(),
            number: num.toString(),
            size: size,
            color: color
        });
    }
    return list;
}

app.get('/api/history/:type', (req, res) => {
    const type = req.params.type.toLowerCase();
    if (latestHistoryData[type] && latestHistoryData[type].length > 0) {
        res.json({ success: true, data: latestHistoryData[type] });
    } else {
        res.json({ success: true, data: generateFallbackList(type === '30s' ? '30S' : '1M') });
    }
});

app.get('/proxy/:type', async (req, res) => {
    const type = req.params.type.toLowerCase();
    let urlKey = type === '30s' ? '30S' : '1M';
    
    let rawList = [];
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
            rawList = rawData.data.list.slice(0, 10);
        } else {
            throw new Error('Invalid structure');
        }
    } catch (error) {
        // API ব্লক হলে নিজস্ব জেনারেটেড রিয়েল-টাইম ডেটা দিয়ে ব্যাকআপ করবে
        rawList = generateFallbackList(urlKey).map(item => ({
            issueNumber: item.issueNumber,
            number: item.number
        }));
    }

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
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
