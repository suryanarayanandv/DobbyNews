import { is_similar_content } from "../summarizer/summarizer.js";
import { get_supported_channels, get_feeds, get_parser, filter_contents_for_current_date } from "./utils.js";

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

    return unique_filteration_content_list;

  } catch (error) {
    console.log("directory: ", __dirname);
    console.error("Error fetching feeds:", error);
    throw error;
  }
}

fetch_feeds_for_context("uk");

async function get_feeds_map(channels) {
  let feeds_map = {};

  for (const channel of channels) {
    console.log(`Fetching feeds from: ${channel.name}`);
    const feeds_items = await get_feeds(channel.url);
    if (!feeds_items || !feeds_items.items || feeds_items.items.length === 0) {
      console.warn(`No items found for channel: ${channel.name}`);
      continue;
    }
    feeds_map[channel.name] = feeds_items.items;
  }
  return feeds_map;
}
