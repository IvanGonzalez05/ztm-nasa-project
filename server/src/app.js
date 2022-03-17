const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// commented to use version 1 api
// const planetsRouter = require("./routes/planets/planets.router");
// const launchesRouter = require("./routes/launches/launches.router");
// importing the v1 api
const apiRouter = require("./routes/api");

const app = express();

// middleware
// to enable cors
app.use(
  cors({
    // just allows this origin to make requests to api
    // since the public files are already being served by
    // express server, this could be commented
    origin: "http://localhost:3000",
  })
);
// to log requests
app.use(morgan("combined"));
// to parse body to json
app.use(express.json());
// to serve the public files
app.use(express.static(path.join(__dirname, "..", "public")));

// routes
// moved to routes/api to use versioning
// app.use("/v1/planets", planetsRouter);
// app.use("/v1/launches", launchesRouter);
// using versioning
app.use("/v1", apiRouter);
// an example of using version 2.
// app.use('/v2', v2Router);
app.get("/*", (req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "index.html"))
);

// exporting app
module.exports = app;
