import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import Actor from "../../../../api/actors/actorModel";
import api from "../../../../index";
import { getActors } from "../../../../api/tmdb-api";

const expect = chai.expect;
let db;
let actors;
let token = "eyJhbGciOiJIUzI1NiJ9.dXNlcjI.Khzm2HbzffuLtUSkKQX3eGrWGOnMzlM4T-zElZu7gNA";

describe("actors endpoint", () => {
    before(() => {
      mongoose.connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      db = mongoose.connection;
    });
  
    after(async () => {
      try {
        await db.dropDatabase();
      } catch (error) {
        console.log(error);
      }
    });
  
    beforeEach(async () => {
      try {
        actors = await getActors();
        await Actor.deleteMany();
        await Actor.collection.insertMany(actors);
      } catch (err) {
        console.error(`failed to Load actor Data: ${err}`);
      }
    });
    afterEach(() => {
      api.close(); // Release PORT 8080
    });
  
  
    //get actors
    describe("GET /api/actors", () => {
      it("should return 20 actors and a status 200", () => {
        request(api)
          .get("/api/actors?page=1&limit=20")
          .set("Authorization", "BEARER " + token)
          .set('Accept', 'application/json')
          .expect("Content-Type", /json/)
          .expect(200)
          .then((err,res) => {
            if(err){throw err;}
            expect(res.body.results).to.be.a("array");
            expect(res.body.results.length).to.equal(actors.length);
          });
      });
    });


    //get actor details by id
  describe("GET /api/actors/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching actor", () => {
        request(api)
          .get(`/api/actors/${actors[0].id}`)
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((err,res) => {
            if(err){throw err;}
            expect(res.body).to.have.property("name", actors[0].name);
          });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/actors/9999")
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The resource you requested could not be found.",
          });
      });
    });
  });
});