import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import TV from "../../../../api/tvs/tvModel";
import api from "../../../../index";
import { getTVs,getTVReviews } from "../../../../api/tmdb-api";

const expect = chai.expect;
let db;
let tvs;
let reviews;

describe("tvs endpoint", () => {
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
        tvs = await getTVs();
        reviews = await getTVReviews(tvs[0].id);
        await TV.deleteMany();
        await TV.collection.insertMany(tvs);
      } catch (err) {
        console.error(`failed to Load tv Data: ${err}`);
      }
    });
    afterEach(() => {
      api.close(); // Release PORT 8080
    });
  
  
    //get tvs
    describe("GET /api/tvs", () => {
      it("should return 20 tvs and a status 200", (done) => {
        request(api)
          .get("/api/tvs?page=1&limit=20")
          // .set("Authorization", "BEARER " + token)
          .set('Accept', 'application/json')
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err,res) => {
            if(err){throw err;}
            expect(res.body.results).to.be.a("array");
            expect(res.body.results.length).to.equal(tvs.length);
            done();
          });
      });
    });


    //get tv details by id
  describe("GET /api/tvs/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching tv", (done) => {
        request(api)
          .get(`/api/tvs/${tvs[0].id}`)
          // .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err,res) => {
            if(err){throw err;}
            expect(res.body).to.have.property("name", tvs[0].name);
            done();
          });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/tvs/9999")
          // .set("Authorization", "BEARER " + token)
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


  //get tv reviews by tv id
  describe("GET /api/tvs/:id/reviews", () => {
    describe("when the tv id is valid", () => {
      it("should return reviews of the matching tv", done => {
        request(api)
          .get(`/api/tvs/${tvs[0].id}/reviews`)
          // .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            if (err) throw err
            expect(res.body).to.be.a("array");
            expect(res.body.length).to.equal(reviews.length);
            done();
          });
      });
    });

    describe("when the tv id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/tvs/9999/reviews")
          // .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The tv id you requested could not be found.",
          });
      });
    });
  });


  //post tv review by tv id
  describe("POST /api/tvs/:id/reviews", () => {
    describe("when the tv id is valid", () => {
      describe("when the author and content is empty", () => {    //empty input
        it("should return the message of empty input", () => {
          request(api)
            .post(`/api/tvs/${tvs[0].id}/reviews`)
            // .set("Authorization", "BEARER " + token)
            .set("Accept", "application/json")
            .send({ author: "User1" })
            .expect("Content-Type", /json/)
            .expect(401)
            .expect({
              status_code: 401,
              message: "Please enter your name and review content.",
            });
        })
      });
      describe("when the author and content is not empty", () => {
        describe("when the input content is too short", () => {
          it("should return the message of review content too short", () => {
            request(api)
              .post(`/api/tvs/${tvs[0].id}/reviews`)
              // .set("Authorization", "BEARER " + token)
              .set("Accept", "application/json")
              .send({ author: "User1", content: "Good" })
              .expect("Content-Type", /json/)
              .expect(401)
              .expect({
                status_code: 401,
                message: "Review content should be no less than 10 characters.",
              });
          })
        });
        describe("when the input content is valid",()=>{
          it("should add the review and return message of successfully added",()=>{
            request(api)
              .post(`/api/tvs/${tvs[0].id}/reviews`)
              // .set("Authorization", "BEARER " + token)
              .set("Accept", "application/json")
              .send({
                author : "User1",
                content : "A pretty good tv"
              })
              .expect("Content-Type", /json/)
              .expect(201)
              .expect({
                status_code: 201,
                message: "Successful created new review."
              })
          })
        })
      })
    })

    describe("when the tv id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .post('/api/tvs/9999/reviews')
          // .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .send({
            author: "User1",
            content: "A pretty good tv"
          })
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The tv id you requested could not be found.",
          });
      })
    })
  });
});