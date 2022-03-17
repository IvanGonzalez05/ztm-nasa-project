const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", "./.env") });
const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready");
});

mongoose.connection.on("error", (err) => {
  console.error(`Error connecting to MongoDB`);
  console.error(err);
});

mongoose.connection.on("close", () => {
  console.log("Closed connection");
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  // await mongoose.connection.close();
  await mongoose.disconnect();
}

module.exports = { mongoConnect, mongoDisconnect };

// this file was created to share database connection logic between the server and the tests files
