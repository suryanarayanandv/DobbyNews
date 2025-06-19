import fs from "fs";
import path from 'path'
import readline from 'readline';
import { pipeline } from '@xenova/transformers';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gloveFile = path.join(__dirname, 'glove.twitter.27B.200d.txt');
let embeddings = {};

/**
 * reference: https://nlp.stanford.edu/projects/glove/
 * GloVe is an unsupervised learning algorithm for obtaining vector representations for words.
 * The algorithm is based on the idea that words that appear in similar contexts tend to have similar meanings.
 * [deprecated]
 */
  async function load_glove_embeddings(glovePath) {
    const embedding_map = {};
    const fileStream = fs.createReadStream(glovePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const parts = line.split(' ');
        const word = parts.shift();
        embedding_map[word] = parts.map(Number);
    }
    embeddings = embedding_map;
}

// [deprecated]
const tokenize = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/);
}

/**
 * Computes the average vector for a set of words.
 * @param {string[]} words - The words to average.
 * @param {Object} embeddings - The word embeddings.
 * @param {number} dim - The dimensionality of the embeddings.
 * 
 * TODO: Produces 50% expected results, Need improvement
 */
const get_averege_vector = async (content) => {
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await extractor(content);
  return output.data;
}

/**
 * Cosine similarity between two vectors. 
 */
const find_cosine_similarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

/**
 * Similarity between two content
 */
const compare_content = async (contentA, contentB) => {
    const vec1 = await get_averege_vector(contentA);
    const vec2 = await get_averege_vector(contentB);

    if (!vec1 || !vec2) {
        return 0; // No common words found
    }

    const maxLength = Math.max(vec1.length, vec2.length);
    const paddedA = Array.from(vec1).concat(Array(maxLength - vec1.length).fill(0));
    const paddedB = Array.from(vec2).concat(Array(maxLength - vec2.length).fill(0));

    return find_cosine_similarity(paddedA, paddedB).toFixed(4);
}

const is_similar_content = async (contentA, contentB, threshold = 0.5) => {
    const similarity = await compare_content(contentA, contentB);
    return parseFloat(similarity) >= threshold;
}

const content1 = "Legal things when supplying software as a business";
const content2 = "Legal things when developing and supplying soft-wares as a business";

(async () => {
    const isSimilar = await is_similar_content(content1, content2);
    console.log(`Are the contents similar? ${isSimilar}`);
})().catch(err => {
    console.error("Error in main execution:", err);
});