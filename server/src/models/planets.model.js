// This file is the same as index.js on the planets project. See that file to read comments

// This file reads the kepler_data.csv on the data folder, and exports habitable planets
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const planets = require("./planets.mongo");

// const habitablePlanets = [];

// to determine wether a planet is habitable or not
function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // habitablePlanets.push(data);
          await savePlanet(data);
        }
      })
      .on("error", (err) => reject(err))
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  // the first object is a filter (we dont want to filter)
  // so the object is empty. The second one is the fields
  // we dont want to show. 1 is for showing them, 0 to not
  return await planets.find(
    {},
    {
      __v: 0,
      _id: 0,
    }
  );
}

async function savePlanet(planet) {
  try {
    // first arg is a filter: if the object is found on db will be updated with the object in the second arg
    // the third object, "upsert" means if the object its not found, will insert the first second arg
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`Could not save planet: ${error}`);
  }
}

module.exports = {
  getAllPlanets,
  loadPlanetsData,
};
