const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON রিকোয়েস্ট বডি পার্স করার জন্য
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// লেটেস্ট ডেটা স্টোর করার মেমোরি
let latestHistoryData = {
    '30s': [],
    '1m': []
};

// ফ্রন্টএন্ড থেকে ডেটা রিসিভ করার এন্ডপয়েন্ট (POST)
app.post('/api/sync-history', (req, res) => {
    const { type, data } = req.body;
    if (type && Array.isArray(data)) {
        latestHistoryData[type] = data;
        return res.json({ success: true, message: 'Data synced successfully' });
    }
    res.status(400).json({ success: false, message: 'Invalid data format' });
});

// আপনার চাওয়া ফরম্যাটে বাইরের দুনিয়ার জন্য API এন্ডপয়েন্ট (GET)
// যেমন: /api/history/30s বা /api/history/1m
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
