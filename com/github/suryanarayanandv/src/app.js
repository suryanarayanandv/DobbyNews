import express from 'express'
import { fetch_and_update_today_feeds, fetch_feeds_for_context } from './parser/main.js';
import { filter_update_content_history } from './parser/utils.js';
import { log } from './parser/logger.js';
import fs from 'fs';
import { get_mongo_client } from './model/connection.js';

const app = new express();

app.get('/helloworld', (req, res) => {
    const response = {
        message: 'Hello, World!'
    };

    res.json(response);
});

app.post('/schedule/feeds', (req, res) => {
    const today = new Date().toISOString();
    console.log(`Received request for today :: ${today}`);

    res.json({ message: `Feed update started for today: ${today}` });

    fetch_and_update_today_feeds()
    .then(() => {
        console.log(`Successfully updated feeds for today :: ${today}`);
    })
    .catch((error) => {
        console.error(`Error updating feeds for today: ${error.message}`);
    });
});

app.get('/contents/:context', async (req, res) => {
    const { context } = req.params;
    if (!context) {
        return res.status(400).json({ error: 'Context parameter is required' });
    }
    const today = new Date().toISOString();
    console.log(`Received request for context: ${context} :: ${today}`);

    // let filtered_news = fs.readFileSync(`./current-day-contents-${context}.json`, 'utf-8');
    const current_date_ms = new Date().setHours(0, 0, 0, 0);
    const connection = await get_mongo_client();
    const current_day_news = await (connection.db("DobbyNews").collection("News")).findOne({ context: context, date: current_date_ms });

    if (!current_day_news) {
        return res.status(404).json({ error: 'No news found for today and context.' });
    }
    let filtered_news = current_day_news.news;

    const response = {
        message: `News Today ${today}`,
        context: context,
        contents: filtered_news
    }

    connection.close();
    res.json(response);
});

const port = process.env.PORT || 3412;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});