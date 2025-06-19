const fs = require('fs');
const path = require('path');

const gloveFile = path.join(__dirname, 'glove.6B.300d.txt');
const embeddings = {};

/**
 * reference: https://nlp.stanford.edu/projects/glove/
 * GloVe is an unsupervised learning algorithm for obtaining vector representations for words.
 * The algorithm is based on the idea that words that appear in similar contexts tend to have similar meanings.
 */
const load_glove_embeddings = () => {
  console.log(gloveFile);
  const lines = fs.readFileSync(gloveFile, 'utf-8').split('\n');
  for (let line of lines) {
    const parts = line.trim().split(' ');
    const word = parts[0];
    const vector = parts.slice(1).map(Number);
    if (word && vector.length > 0) {
      embeddings[word] = vector;
    }
  }
  console.log('Loaded embeddings:', Object.keys(embeddings).length);
}

const tokenize = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/);
}

/**
 * Computes the average vector for a set of words.
 * @param {string[]} words - The words to average.
 * @param {Object} embeddings - The word embeddings.
 * @param {number} dim - The dimensionality of the embeddings.
 */
const get_averege_vector = (words, embeddings, dim = 50) => {
  let sum = Array(dim).fill(0);
  let count = 0;

  for (let word of words) {
    const vec = embeddings[word];
    if (vec) {
      sum = sum.map((v, i) => v + vec[i]);
      count++;
    }
  }

  return count > 0 ? sum.map(v => v / count) : null;
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
const compare_content = (contentA, contentB) => {
    load_glove_embeddings();

    const words1 = tokenize(contentA);
    const words2 = tokenize(contentB);

    const vec1 = get_averege_vector(words1, embeddings);
    const vec2 = get_averege_vector(words2, embeddings);

    if (!vec1 || !vec2) {
        return 0; // No common words found
    }

    return find_cosine_similarity(vec1, vec2).toFixed(4);
}

const is_similar_content = (contentA, contentB, threshold = 0.7) => {
    const similarity = compare_content(contentA, contentB);
    return similarity >= threshold;
}

// Test
if (require.main === module) {
    const content1 = "Legal considerations when developing and supplying software as a business";
    const content2 = "Accommodation expenses as a limited company contractor";
    
    console.log("Are contents similar?", compare_content(content1, content2));
}