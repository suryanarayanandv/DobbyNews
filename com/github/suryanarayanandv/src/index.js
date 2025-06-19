

// read from supported-channels.json file
// fs.readFile("./parser/supported-channels.json", (err, data) => {
//   if (err) throw err;
//   let channels = JSON.parse(data);
// });

// (async () => {

//   let feed = await parser.parseURL('http://sg-accounting.co.uk/feed');
//   console.log(feed.title);

//   feed.items.forEach(item => {
//     console.log('Title: ' + item.title);
//     console.log('Link: ' + item.link);
//     console.log('Date: ' + item.pubDate);
//     console.log('Content: ' + item.contentSnippet);
//     console.log('-----------------------------------');
//   });

// })();

const path = require('path');
const gloveFile = path.join(__dirname, 'glove.6B.300d.txt');
console.log('Loading GloVe embeddings from:', gloveFile);