const axios = require("axios");

const launchesModel = require("./launches.mongo");
const planets = require("./planets.mongo");
const params = require("./spacex.launches.query");

// const launches = new Map();
// let latestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100,
//   mission: "Kepler Exploration X",
//   rocket: "Exploresr IS1",
//   launchDate: new Date("December 27, 2030"),
//   target: "Kepler-442 b",
//   customers: ["NASA", "ZTM"],
//   upcoming: true,
//   success: true,
// };

// launches.set(launch.flightNumber, launch);
// saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, params);

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => payload.customers);
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    await saveLaunch(launch);
  }
}
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("spacex data already loaded");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesModel.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  // return launches.has(launchId);
  // return await launchesModel.findOne({ flightNumber: launchId });
  return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
  // sort all launches, pick the first one
  // sort orders from lower to higher
  // the (-) reverts the order
  const latestLaunch = await launchesModel.findOne().sort("-flightNumber");

  if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;
  return latestLaunch.flightNumber;
  // return latestLaunch.flightNumber || DEFAULT_FLIGHT_NUMBER;
}

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launchesModel
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesModel.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

// mongo version of addNewLaunch
async function scheduleLaunch(launch) {
  const planet = planets.findOne({ keplerName: launch.target });

  if (!planet) {
    throw new Error("No matching planet found when saving launch");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

// map version of launches
// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: latestFlightNumber,
//       customers: ["ZTM", "NASA"],
//       upcoming: true,
//       success: true,
//     })
//   );
// }

async function abortsLaunchById(launchId) {
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;

  // launches.set(launchId, aborted);
  // return aborted;
  const aborted = await launchesModel.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted;
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  // addNewLaunch,
  scheduleLaunch,
  abortsLaunchById,
};
