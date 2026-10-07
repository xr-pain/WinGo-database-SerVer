const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// ডুপ্লিকেট এড়ানোর জন্য ট্র্যাকিং
let lastProcessedIssues = {
    '30s': null,
    '1m': null,
    '3m': null
};

// আপনার চাওয়া ফরম্যাটে ডেটা সাজানোর ফাংশন
function formatItemData(item) {
    const num = Number.parseInt(item.number, 10);
    const size = num >= 5 ? 'Big' : 'Small';
    
    let color = 'green';
    if ([2, 4, 6, 8].includes(num)) color = 'red';
    else if (num === 0 || num === 5) color = num === 0 ? 'red,violet' : 'green,violet';

    // বর্তমান লাইভ সময়
    const exactTime = new Date().toLocaleTimeString();

    return {
        Period: String(item.issueNumber ?? ''),
        Number: num,
        Size: size,
        Colour: color,
        Time: exactTime
    };
}

// শক্তিশালী ব্রাউজার হেডার যা 403 Forbidden বাইপাস করতে সাহায্য করবে
const getCustomHeaders = (urlKey) => ({
    'Host': 'draw.ar-lottery01.com',
    'Connection': 'keep-alive',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="8", "Google Chrome";v="122"',
    'Accept': 'application/json, text/plain, */*',
    'sec-ch-ua-mobile': '?0',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'sec-ch-ua-platform': '"Windows"',
    'Origin': 'https://ar-lottery01.com',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://ar-lottery01.com/',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-store'
});

async function handleApiRequest(req, res, urlKey, category) {
    try {
        const targetUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_${urlKey}/GetHistoryIssuePage.json?ts=` + Date.now();
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: getCustomHeaders(urlKey)
        });
        
        if (!response.ok) {
            throw new Error(`API Error status: ${response.status}`);
        }
        
        const rawData = await response.json();
        if (!rawData || !rawData.data || !Array.isArray(rawData.data.list)) {
            throw new Error('Invalid data format from API');
        }

        const rawList = rawData.data.list;
        const formattedList = rawList.map(item => formatItemData(item));

        // শুধু নতুন ডেটা ফিল্টার করা (যা আগে দেখানো হয়নি)
        let latestItems = formattedList;
        if (lastProcessedIssues[category]) {
            const lastIndex = formattedList.findIndex(i => i.Period === lastProcessedIssues[category]);
            if (lastIndex > 0) {
                latestItems = formattedList.slice(0, lastIndex);
            } else if (lastIndex === 0) {
                latestItems = []; // নতুন ডেটা না থাকলে খালি দেখাবে
            }
        }

        if (formattedList.length > 0) {
            lastProcessedIssues[category] = formattedList[0].Period;
        }

        // আপনার কাঙ্ক্ষিত ফরম্যাটে আউটপুট পাঠানো
        res.json({
            success: true,
            data: latestItems
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            message: "Target API blocked the server IP. Please use a public CORS proxy or alternative endpoint." 
        });
    }
}

app.get('/api/history/30s', (req, res) => handleApiRequest(req, res, '30S', '30s'));
app.get('/api/history/1m', (req, res) => handleApiRequest(req, res, '1M', '1m'));
app.get('/api/history/3m', (req, res) => handleApiRequest(req, res, '3M', '3m'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
