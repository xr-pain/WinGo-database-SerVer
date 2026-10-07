const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// প্রিভিয়াস পিরিয়ড ট্র্যাক করার জন্য মেমোরি স্টোরেজ (ডুপ্লিকেট এড়াতে)
let lastProcessedIssues = {
    '30s': null,
    '1m': null,
    '3m': null
};

// কালার এবং সাইজ বের করার ফাংশন
function formatItemData(item) {
    const num = Number.parseInt(item.number, 10);
    const size = num >= 5 ? 'Big' : 'Small';
    
    let color = 'green';
    if ([2, 4, 6, 8].includes(num)) color = 'red';
    else if (num === 0 || num === 5) color = num === 0 ? 'red,violet' : 'green,violet';

    // বর্তমান ফরম্যাটেড সময় বা এপিআইয়ের সার্ভিস টাইম
    const exactTime = new Date().toLocaleTimeString();

    return {
        Period: String(item.issueNumber ?? ''),
        Number: num,
        Size: size,
        Colour: color,
        Time: exactTime
    };
}

// কমন হেডার
const customHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Cache-Control': 'no-store'
};

// API Endpoints for 30S, 1M, 3M
async function handleApiRequest(req, res, urlKey, category) {
    try {
        const response = await fetch(`https://draw.ar-lottery01.com/WinGo/WinGo_${urlKey}/GetHistoryIssuePage.json?ts=` + Date.now(), {
            headers: customHeaders
        });
        if (!response.ok) throw new Error('API error');
        
        const rawData = await response.json();
        if (!rawData.data || !Array.isArray(rawData.data.list)) {
            throw new Error('Invalid data');
        }

        // লিস্ট থেকে সব আইটেম ফরম্যাট করা
        const formattedList = rawData.data.list.map(item => formatItemData(item));

        // শুধু নতুন বা লেটেস্ট ডেটা ফিল্টার করা (যা আগে দেখানো হয়নি)
        let latestItems = formattedList;
        if (lastProcessedIssues[category]) {
            const lastIndex = formattedList.findIndex(i => i.Period === lastProcessedIssues[category]);
            if (lastIndex > 0) {
                latestItems = formattedList.slice(0, lastIndex);
            } else if (lastIndex === 0) {
                // যদি নতুন কোনো ড্র না এসে থাকে, অন্তত ১টি লেটেস্ট দেখাবে
                latestItems = [formattedList[0]];
            }
        }

        if (formattedList.length > 0) {
            lastProcessedIssues[category] = formattedList[0].Period;
        }

        // আপনার চাওয়া নির্দিষ্ট ফরম্যাটে আউটপুট পাঠানো
        res.json({
            success: true,
            totalNew: latestItems.length,
            data: latestItems
        });

    } catch (error) {
        res.status(500).json({ error: `Failed to fetch ${category} data`, data: [] });
    }
}

app.get('/api/history/30s', (req, res) => handleApiRequest(req, res, '30S', '30s'));
app.get('/api/history/1m', (req, res) => handleApiRequest(req, res, '1M', '1m'));
app.get('/api/history/3m', (req, res) => handleApiRequest(req, res, '3M', '3m'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
