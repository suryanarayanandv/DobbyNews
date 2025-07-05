
import { MongoClient, ServerApiVersion } from 'mongodb';
import 'dotenv/config'

// read .env for username, password

const mysql_username = process.env.mysql_username;
const mysql_password = process.env.mysql_password;
const uri = "mongodb+srv://" + mysql_username + ":" + mysql_password + "@dobbynewscluster0.k93um83.mongodb.net/?retryWrites=true&w=majority&appName=DobbyNewsCluster0";

console.log("MongoDB URI:", uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const get_mongo_client = async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
  return client;
}

export { get_mongo_client };