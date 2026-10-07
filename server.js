const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ব্রাউজার থেকে পাঠানো ডেটা এখানে স্টোর হবে
let latestHistoryData = {
    '30s': [],
    '1m': []
};

// আপনার সার্ভার API (যেখান থেকে আপনি JSON ডেটা রিড করবেন)
app.get('/api/history/:type', (req, res) => {
    const type = req.params.type.toLowerCase();
    if (latestHistoryData[type] && latestHistoryData[type].length > 0) {
        res.json({ success: true, data: latestHistoryData[type] });
    } else {
        res.json({ success: false, message: 'Waiting for browser sync...' });
    }
});

// ব্রাউজার এই এন্ডপয়েন্টে ডেটা পোস্ট করে সেভ করবে
app.post('/api/sync-history', (req, res) => {
    const { type, data } = req.body;
    if (type && Array.isArray(data)) {
        latestHistoryData[type] = data;
        return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: 'Invalid data' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
