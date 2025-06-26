import cron from 'node-cron';
import fs from 'fs';
import { filter_update_content_history, get_supported_contexts } from './parser/utils.js';
import { fetch_feeds_for_context } from './parser/main.js';

cron.schedule("0 10 * * *", async () => {
    console.log("Running scheduled task to fetch feeds at 10:00 AM for the day", new Date().toISOString());
    const supported_contexts = await get_supported_contexts();
    console.log("Supported contexts:", supported_contexts);
    if (!supported_contexts || supported_contexts.length === 0) {
      console.error("No supported contexts found. Exiting scheduled task.");
      return;
    }

    for (const context_obj of supported_contexts) {
        try {
            console.log(`Fetching feeds for context: ${context_obj.context}`);
            let filtered_news = await fetch_feeds_for_context(context_obj.context);
            filtered_news = filter_update_content_history(filtered_news);

            const __dirname = new URL(".", import.meta.url).pathname;
            const file_path = `${__dirname}/current-day-contents-${context_obj.context}.json`;
            fs.writeFile(file_path, JSON.stringify(filtered_news, null, 2), (err) => {
                if (err) {
                    console.error(`Error writing to current-day-contents-${context_obj.context}.json:`, err);
                } else {
                    console.log(`Successfully updated current-day-contents-${context_obj.context}.json`);
                }
            });
        } catch (error) {
            console.error(`Error fetching feeds for context ${context_obj.context}:`, error);
        }
    }
},
  { scheduled: true, timezone: "IST" }
);

console.log('Cron job scheduler started.', new Date().toISOString());

// Prevent the process from exiting
setInterval(() => {}, 1000 * 60);
