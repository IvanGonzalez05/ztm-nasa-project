// importing the http core module and app from its folder
const http = require("http");
const path = require("path");
const dotenv = require("dotenv");
// the config gotta be used before at the beginnig
// to be able to use the database
dotenv.config({ path: path.join(__dirname, "./.env") });
// const mongoose = require("mongoose");
const app = require("./app");
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");
const { mongoConnect } = require("./services/mongo");

// creating the http server using the app from express
// the server was created this way, using http module
// and the express app as a listener, because later
// we will be using sockets (note: seems like express is compatible, so I dont really know the point of this)
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

// moved to services > mongo
// const MONGO_URL =
//   "mongodb+srv://sa:sa@cluster0.zqpfk.mongodb.net/nasa?retryWrites=true&w=majority";
// mongoose.connection.once("open", () => {
//   console.log("MongoDB connection ready");
// });

// mongoose.connection.on("error", (err) => {
//   console.error(`Error connecting to MongoDB`);
//   console.error(err);
// });

async function startServer() {
  // in mongo version less than v6
  // await mongoose.connect(MONGO_URL, {
  //   useNewUrlParser: true, // to parse correctly the connection string
  //   useFindAndModify: false, // disables outdated way to update mongo data
  //   useCreateIndex: true, // use a secure create index function
  //   useUnifiedTopology: true, // use updated way of talkin to mongo clusters
  // });
  // await mongoose.connect(MONGO_URL);
  await mongoConnect();

  // loads data before starting the server
  // since the data is read asynchronously, we need to get it before the server starts
  await loadPlanetsData();
  // loads launches data before server starts
  await loadLaunchData();

  // starts server
  server.listen(PORT, () => {
    console.log(`Listening at port ${PORT}...`);
  });
}

startServer();
