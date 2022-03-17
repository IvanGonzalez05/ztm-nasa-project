// an npm module that allows me to simulate an http request
const request = require("supertest");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const app = require("../../app");
const { loadPlanetsData } = require("../../models/planets.model");

// every test is inside a shared describe jest function
// done this way to be able to connect to mongo
// in each test
describe("Launches API", () => {
  // this will run before all the tests
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });
  // this will run after all the tests
  afterAll(async () => await mongoDisconnect());

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      // supertest needs the app as first arg
      // the request has the HTTP methods
      // and the expect function
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      // using jest expect
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "lolo",
    };

    test("It should respond with 201 success", async () => {
      // sending a POST request using supertest
      // post method and send method
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      // using jests assertions to make sure the response body is correct
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      // sending a bad request
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      // jest assertions
      // toStrictEqual matches values and structure
      expect(response.body).toStrictEqual({
        error: "missing required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      // sending a bad request
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      // jest assertions
      // toStrictEqual matches values and structure
      expect(response.body).toStrictEqual({
        error: "invalid launch date",
      });
    });
  });
});
