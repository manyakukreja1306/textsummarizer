const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pipeline } = require('@xenova/transformers');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

let summarizer;

(async () => {
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
    console.log('Model loaded');

    // Start the server AFTER model is ready
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})();

app.post('/summarize', async (req, res) => {
    try {
        const inputText = req.body.text;
        if (!inputText) {
            return res.status(400).json({ error: 'No text provided' });
        }

        const result = await summarizer(inputText, {
            max_length: 50,
            min_length: 25,
            do_sample: false
        });

        res.json({ summary: result[0].summary_text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Summarization failed' });
    }
});

