import chai from "chai";
import request from "supertest";
import { getActors, getMovies, getTVs } from "../../../../api/tmdb-api";
const mongoose = require("mongoose");
import User from "../../../../api/users/userModel";
import api from "../../../../index";

const expect = chai.expect;
let db;
let user1token;
let user_id;
let movies;
let actors;
let tvs;

describe("Users endpoint", () => {
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
      actors = await getActors();
      tvs = await getTVs();
      // await User.deleteMany();
      // Register two users
      await request(api).post("/api/users?action=register").send({
        username: "user1",
        password: "test1",
      });
      await request(api).post("/api/users?action=register").send({
        username: "user2",
        password: "test2",
      });
    } catch (err) {
      console.error(`failed to Load user test Data: ${err}`);
    }
  });
  afterEach(() => {
    api.close();
  });


  describe("GET /api/users ", () => {
    it("should return the 2 users and a status 200", () => {
      request(api)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.equal(2);
          let result = res.body.map((user) => user.username);
          expect(result).to.have.members(["user1", "user2"]);
        });
    });
  });

  describe("POST /api/users ", () => {
    describe("For a register action", () => {
      describe("when the payload is correct", () => {
        it("should return a 201 status and the confirmation message", () => {
          return request(api)
            .post("/api/users?action=register")
            .send({
              username: "user3",
              password: "test3",
            })
            .expect(201)
            .expect({ msg: "Successful created new user.", code: 201 });
        });
        after(() => {
          return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.length).to.equal(3);
              const result = res.body.map((user) => user.username);
              expect(result).to.have.members(["user1", "user2", "user3"]);
            });
        });
      });
    });
    describe("For an authenticate action", () => {
      describe("when the payload is correct", () => {
        it("should return a 200 status and a generated token", () => {
          return request(api)
            .post("/api/users?action=authenticate")
            .send({
              username: "user1",
              password: "test1",
            })
            .expect(200)
            .then((res) => {
              expect(res.body.success).to.be.true;
              expect(res.body.token).to.not.be.undefined;
              user1token = res.body.token.substring(7);
            });
        });
      });
    });
  });


  describe("PUT api/users/:id", () => {
    before(() => {
      request(api)
        .get('api/users')
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          user_id = res.body.map(user => user._id)[0];
        })
    })
    describe("when the user id is valid", () => {
      it("should return successful message and update user info", () => {
        request(api)
          .put(`api/users/${user_id}`)
          .send({
            username: 'User1',
            password: 'Test123'
          })
          .expect(200)
          .expect({
            status_code: 200,
            message: "User Updated Sucessfully",
          });
      })
    });
    describe("when the user is invalid", () => {
      it("should return failed messaage", () => {
        request(api)
          .put('api/users/9999')
          .send({
            username: 'User1',
            password: 'Test123'
          })
          .expect(404)
          .expect({
            status_code: 404,
            message: "Unable to Update User"
          })
      })
    })
  })


  describe("GET api/users/:userName/favourites", () => {
    describe("when the username is valid", () => {
      it("should get favourites list and return successful message", () => {
        request(api)
          .get(`api/users/User1/favourites`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
      })
    })
    describe("when the username is invalid", () => {
      it("should return not found message", () => {
        request(api)
          .get(`api/users/XXX/favourites`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "Username not existed"
          })
      })
    })
  });


  describe("GET api/users/:userName/likes", () => {
    describe("when the username is valid", () => {
      it("should get likes list and return successful message", () => {
        request(api)
          .get(`api/users/User1/likes`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
      })
    })
    describe("when the username is invalid", () => {
      it("should return not found message", () => {
        request(api)
          .get(`api/users/XXX/likes`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "Username not existed"
          })
      })
    })
  });

  describe("GET api/users/:userName/watchlist", () => {
    describe("when the username is valid", () => {
      it("should get watchlist list and return successful message", () => {
        request(api)
          .get(`api/users/User1/watchlist`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
      })
    })
    describe("when the username is invalid", () => {
      it("should return not found message", () => {
        request(api)
          .get(`api/users/XXX/watchlist`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "Username not existed"
          })
      })
    })
  });

  describe("POST api/users/:userName/favourites", () => {
    describe("when the username is valid", () => {
      describe("when the movie id is invalid", () => {
        it("should return a message of movie not found", () => {
          request(api)
            .post(`api/user/user1/favourites`)
            .send({ id: 123456 })
            .expect(401)
            .expect({ status_code: 401, message: "Movie id does not existed." });
        });
      });
      describe("when the movie has already in the list", () => {
        it("should return a message of existed movie in the list", () => {
          request(api)
            .post(`api/user/user1/favourites`)
            .send({ id: movies[0].id });
          request(api)
            .post(`api/user/user1/favourites`)
            .send({ id: movies[0].id })
            .expect(401)
            .expect({ status_code: 401, message: "Already in favourites." });
        })
      });
      describe("when the movie id is invalid and is not in the list", () => {
        it("should add the movie in the list and return a successful message", () => {
          request(api)
            .post('api/user/user1/favourites')
            .send({ id: movies[1].id })
            .expect(201)
        })
      });
    });
    describe("when the username is invalid", () => {
      it("should return a message of invalid username", () => {
        request(api)
          .post('api/users/XXX/favourites')
          .send({ id: movies[0].id })
          .expect(404)
          .expect({ status_code: 404, message: "Username not existed" });
      })
    });
  })


  describe("POST api/users/:userName/likes", () => {
    describe("when the username is valid", () => {
      describe("when the actor id is invalid", () => {
        it("should return a message of actor not found", () => {
          request(api)
            .post(`api/user/user1/likes`)
            .send({ id: 123456 })
            .expect(401)
            .expect({ status_code: 401, message: "actor id does not existed." });
        });
      });
      describe("when the actor has already in the list", () => {
        it("should return a message of existed actor in the list", () => {
          request(api)
            .post(`api/user/user1/likes`)
            .send({ id: actors[0].id });
          request(api)
            .post(`api/user/user1/likes`)
            .send({ id: actors[0].id })
            .expect(401)
            .expect({ status_code: 401, message: "Already in likes." });
        })
      });
      describe("when the actor id is invalid and is not in the list", () => {
        it("should add the actor in the list and return a successful message", () => {
          request(api)
            .post('api/user/user1/likes')
            .send({ id: actors[1].id })
            .expect(201)
        })
      });
    });
    describe("when the username is invalid", () => {
      it("should return a message of invalid username", () => {
        request(api)
          .post('api/users/XXX/likes')
          .send({ id: actors[0].id })
          .expect(404)
          .expect({ status_code: 404, message: "Username not existed" });
      })
    });
  });


  describe("POST api/users/:userName/watchlist", () => {
    describe("when the username is valid", () => {
      describe("when the tv id is invalid", () => {
        it("should return a message of tv not found", () => {
          request(api)
            .post(`api/user/user1/watchlist`)
            .send({ id: 123456 })
            .expect(401)
            .expect({ status_code: 401, message: "tv id does not existed." });
        });
      });
      describe("when the tv has already in the list", () => {
        it("should return a message of existed tv in the list", () => {
          request(api)
            .post(`api/user/user1/watchlist`)
            .send({ id: tvs[0].id });
          request(api)
            .post(`api/user/user1/watchlist`)
            .send({ id: tvs[0].id })
            .expect(401)
            .expect({ status_code: 401, message: "Already in watchlist." });
        })
      });
      describe("when the tv id is invalid and is not in the list", () => {
        it("should add the tv in the list and return a successful message", () => {
          request(api)
            .post('api/user/user1/watchlist')
            .send({ id: tvs[1].id })
            .expect(201)
        })
      });
    });
    describe("when the username is invalid", () => {
      it("should return a message of invalid username", () => {
        request(api)
          .post('api/users/XXX/watchlist')
          .send({ id: tvs[0].id })
          .expect(404)
          .expect({ status_code: 404, message: "Username not existed" });
      })
    });
  });

});
