import express from 'express'
import { fetch_feeds_for_context } from './parser/main.js';
import { filter_update_content_history } from './parser/utils.js';
import { log } from './parser/logger.js';

const app = new express();

app.get('/helloworld', (req, res) => {
    const response = {
        message: 'Hello, World!'
    };

    res.json(response);
});

app.get('/contents/:context', async (req, res) => {
    const { context } = req.params;
    if (!context) {
        return res.status(400).json({ error: 'Context parameter is required' });
    }
    const today = new Date().toISOString();
    log(`Received request for context: ${context} :: ${today}`);

    let filtered_news = await fetch_feeds_for_context(context);
    filtered_news = filter_update_content_history(filtered_news);

    const response = {
        message: `News Today ${today}`,
        context: context,
        contents: filtered_news
    }

    res.json(response);
});

const port = process.env.PORT || 3412;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});