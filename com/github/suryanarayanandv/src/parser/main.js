import fs from 'fs';
import { get_mongo_client } from "../model/connection.js";
import { is_similar_content } from "../summarizer/summarizer.js";
import { get_supported_channels, get_feeds, get_parser, filter_contents_for_current_date, get_supported_contexts, filter_update_content_history } from "./utils.js";

const fetch_feeds_for_context = async (context) => {
  try {
    const channels = await get_supported_channels(context);
    let feeds_map = await get_feeds_map(channels);

    /**
     * feeds_map: {
     *  'feed_name': [
     *      {
     *      }
     *   ]
     * }
     */

    let filtered_feeds_map = {};
    for (const feed_catagory in feeds_map) {
      console.log(`Feed Catagory : ${feed_catagory}`);
      filtered_feeds_map[feed_catagory] = filter_contents_for_current_date(feeds_map[feed_catagory]);
    }

    const now = new Date();
    console.log(`Filtering feeds for current date: ${now.toISOString()}`);
    // Cosaine Smiliar Content will be removed.
    let keys = Object.keys(filtered_feeds_map);
    let unique_filteration_content_list = [];
    unique_filteration_content_list = unique_filteration_content_list.concat(filtered_feeds_map[keys[0]]);
    // Remove duplicates from multiple sources
    for(let i = 1; i < keys.length; i++) {
      let pre_existing_content_list = unique_filteration_content_list;
      let new_content_list = filtered_feeds_map[keys[i]]

      for (const content1 of new_content_list) {
        let is_similar = false;

        for (const content2 of pre_existing_content_list) {
          if (await is_similar_content(content1.title, content2.title)) {
            is_similar = true;
            break;
          }
        }

        if (!is_similar) {
          unique_filteration_content_list.push(content1);
        }
      }
    }
    const endTime = new Date();
    const timeTaken = endTime - now;
    console.log(`Time taken to filter feeds: ${timeTaken} ms`);

    return unique_filteration_content_list;

  } catch (error) {
    console.error("Error fetching feeds:", error);
    throw error;
  }
}
 
// Test
// fetch_feeds_for_context("uk");

async function get_feeds_map(channels) {
  let feeds_map = {};

  const startTime = Date.now();
  console.log(`Fetching feeds for ${channels.length} channels...`);
  for (const channel of channels) {
    console.log(`Fetching feeds from: ${channel.name}`);
    const feeds_items = await get_feeds(channel.url);
    if (!feeds_items || !feeds_items.items || feeds_items.items.length === 0) {
      console.warn(`No items found for channel: ${channel.name}`);
      continue;
    }
    feeds_map[channel.name] = feeds_items.items;
  }
  const endTime = Date.now();
  const timeTaken = endTime - startTime;
  console.log(`Time taken to fetch feeds: ${timeTaken} ms`);

  return feeds_map;
}

async function fetch_and_update_today_feeds() {
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

            const current_date_ms = new Date().setHours(0, 0, 0, 0);
            const current_date_news = {
                context: context_obj.context,
                date: current_date_ms,
                news: filtered_news
            };

            const connection = await get_mongo_client();
            const news_collection = connection.db("DobbyNews").collection("News");
            const previous_date_ms = new Date(current_date_ms - 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
            
            await news_collection.deleteMany({ context: context_obj.context, date: previous_date_ms });
            await news_collection.insertOne(current_date_news);
            console.log(`Successfully updated news for context: ${context_obj.context} for date: ${new Date(current_date_ms).toISOString()}`);
            connection.close();

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
}

export { fetch_feeds_for_context, fetch_and_update_today_feeds };



// TODO:
// End point
// Code refactor, loggers
// Check any other possibilities
// Optimize Filtering takes lots of time