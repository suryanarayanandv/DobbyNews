const Parser = require("rss-parser");
const fs = require("fs");
const parser = new Parser();

const get_supported_channels = (context) => {
  return new Promise((resolve, reject) => {
    fs.readFile("./parser/supported-channels.json", (err, data) => {
      if (err) {
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
const get_feeds = (url) => {
    return new Promise((resolve, reject) => {
        parser.parseURL(url, (err, feed) => {
            if (err) {
                reject(err);
            } else {
                resolve(feed);
            }
        });
    });
}

module.exports = {
    get_supported_channels,
    get_parser
};