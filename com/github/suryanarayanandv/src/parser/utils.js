import Parser from "rss-parser";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const parser = new Parser();


const DATE_THRESHOLD = 30;
const get_supported_channels = (context) => {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    fs.readFile(__dirname + "/supported-channels.json", (err, data) => {
      if (err) {
        console.log("Error while reading channels file: ", err);
        reject(err);
      } else {
        let channels = JSON.parse(data);
        if (channels.channels === undefined || channels.channels === null) {
          reject(new Error("No channels found"));
        }
        channels = channels.channels;
        for (let i = 0; i < channels.length; i++) {
          if (channels[i].context === context) {
            resolve(channels[i].supported_channels);
          }
        }
      }
    });
  });
};


const get_parser = () => {
    return parser;
};


/**
 * 
 * @param {string} url 
 * @returns {Promise} - returns a promise that resolves to the feed object
 * 
 * feed object contains the following properties:
 * `{
 *   items: [
 *     {
 *        title: 'Title of the item',
 *        link: 'Link to the item',
 *        pubDate: 'Publication date of the item',
 *        contentSnippet: 'Snippet of the content',
 *     }
 *   ]
 * }`
 */
const get_feeds = async (url) => {
    try {
    const response = await fetch(url);
    let xml = await response.text();

    // Sanitize the XML by replacing invalid '&' with '&amp;'
    // Only replace & that are not already part of an entity like &amp; or &#123;
    xml = xml.replace(/&(?![a-zA-Z]+;|#\d+;)/g, '&amp;');

    const feed = await parser.parseString(xml);
    return feed;
  } catch (error) {
    console.error('Error fetching/parsing feed:', error.message);
  }
}

const update_content_history = (filtered_content) => {
  fs.readFile("./content-history.json", (err, data) => {
        if (err) {
            console.error("Error reading content-history.json:", err);
            return;
        }
        let history = JSON.parse(data);
        if (!Array.isArray(history)) {
            history = [];
        }

        filtered_content = filtered_content.filter(item => {
            return !history.some(historyItem => historyItem.title === item.title);
        });

        history.push(...filtered_content);
        fs.writeFile("./content-history.json", JSON.stringify(history, null, 2), (err) => {
            if (err) {
                console.error("Error writing to content-history.json:", err);
            }
        });
    });
}


const filter_contents_for_current_date = (feeds_list) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - DATE_THRESHOLD);

    let filtered_content = feeds_list.filter(item => {
        const pubDate = new Date(item.isoDate);
        return pubDate >= thirtyDaysAgo && pubDate <= today;
    });

    // read content-history.json file If the title already exists, remove it from the filtered_content
    // update_content_history(filtered_content)

    return filtered_content;
}

// Test
// await get_feeds("https://www.freeagent.com/blog/feed.rss").then((res) => {
//   console.log(res)
// });

export {
    get_supported_channels,
    get_parser,
    get_feeds,
    filter_contents_for_current_date
}