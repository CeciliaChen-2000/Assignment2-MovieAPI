import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import Movie from "../../../../api/movies/movieModel";
import api from "../../../../index";
import { getMovies, getMovieReviews, getRecommendationMovies } from "../../../../api/tmdb-api";

let movies;
let recommendations;
let reviews;
const expect = chai.expect;
let db;
let token = "eyJhbGciOiJIUzI1NiJ9.dXNlcjI.Khzm2HbzffuLtUSkKQX3eGrWGOnMzlM4T-zElZu7gNA";

describe("Movies endpoint", () => {
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
      movies = await getMovies();
      await Movie.deleteMany();
      await Movie.collection.insertMany(movies);
    } catch (err) {
      console.error(`failed to Load movie Data: ${err}`);
    }
  });
  afterEach(() => {
    api.close(); // Release PORT 8080
  });




  //get movies
  describe("GET /api/movies ", () => {
    it("should return 20 movies and a status 200", () => {
      request(api)
        .get("/api/movies?page=1&limit=20")
        .set("Authorization", "BEARER " + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(movies.length);
        });
    });
  });



  //get movie details by id
  describe("GET /api/movies/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching movie", () => {
        request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("title", movies[0].title);
          });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/movies/9999")
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



  //get movie reviews by movie id
  describe("GET /api/movies/:id/reviews", () => {
    describe("when the movie id is valid", () => {
      before(() => {
        reviews = getMovieReviews(movies[0].id);
      });
      it("should return reviews of the matching movie", () => {
        request(api)
          .get(`/api/movies/${movies[0].id}/reviews`)
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((err, res) => {
            expect(res.body).to.be.a("array");
            expect(res.body.length).to.equal(reviews.length);
          });
      });
    });

    describe("when the movie id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/movies/9999/reviews")
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The movie id you requested could not be found.",
          });
      });
    });
  });


  //post movie review by movie id
  describe("POST /api/movies/:id/reviews", () => {
    describe("when the movie id is valid", () => {
      describe("when the author and content is empty", () => {    //empty input
        it("should return the message of empty input", () => {
          request(api)
            .post(`/api/movies/${movies[0].id}/reviews`)
            .set("Authorization", "BEARER " + token)
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
              .post(`/api/movies/${movies[0].id}/reviews`)
              .set("Authorization", "BEARER " + token)
              .set("Accept", "application/json")
              .send({ author: "User1", content: "Good" })
              .expect("Content-Type", /json/)
              .expect(401)
              .expect({
                status_code: 401,
                message: "Review content should be bo less than 10 characters.",

              });
          })
        });
        describe("when the input content is valid",()=>{
          it("should add the review and return message of successfully added",()=>{
            request(api)
              .post(`/api/movies/${movies[0].id}/reviews`)
              .set("Authorization", "BEARER " + token)
              .set("Accept", "application/json")
              .send({
                author : "User1",
                content : "A pretty good movie"
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

    describe("when the movie id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .post('/api/movies/9999/reviews')
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .send({
            author: "User1",
            content: "A pretty good movie"
          })
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The movie id you requested could not be found.",
          });
      })
    })
  })
  //get recommendation movies by movie id
  describe("GET /api/movies/:id/recommendations", () => {
    describe("when the movie id is valid", () => {
      before(() => {
        recommendations = getRecommendationMovies(movies[0].id);
      });
      it("should return the recommendation movies of the matching movie", () => {
        request(api)
          .get(`/api/movies/${movies[0].id}/recommendations`)
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((err, res) => {
            expect(res.body.results).to.be.a("array");
            expect(res.body.results.length).to.equal(recommendations.length);
          });
      });
    });

    describe("when the movie id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/movies/9999/recommendations")
          .set("Authorization", "BEARER " + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The movie id you requested could not be found.",
          });
      });
    });
  })

  describe("GET /api/movies/tmdb/upcoming", () => {
    it("should return 20 upcoming movies and a status 200", () => {
      request(api)
        .get("api/movies/tmdb/upcoming")
        .set("Authorization", "BEARER " + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/tmdb/popular", () => {
    it("should return 20 popular movies and a status 200", () => {
      request(api)
        .get("api/movies/tmdb/popular")
        .set("Authorization", "BEARER " + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/tmdb/topRated", () => {
    it("should return 20 topRated movies and a status 200", () => {
      request(api)
        .get("api/movies/tmdb/topRated")
        .set("Authorization", "BEARER " + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/tmdb/nowPlaying", () => {
    it("should return 20 nowPlaying movies and a status 200", () => {
      request(api)
        .get("api/movies/tmdb/nowPlaying")
        .set("Authorization", "BEARER " + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results).to.equal(20);
        });
    });
  });
});
