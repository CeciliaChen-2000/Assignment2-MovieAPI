# Assignment 2 - Web API.

Name: Liangyu Chen

## Features.

...... A bullet-point list of the ADDITIONAL features that have been implemented in the API **THAT WERE NOT IN THE LABS** ......,
 
 + Feature  1 - Users - DELETE a user by username
 + Feature  2 - Users - GET like actors list of a user
 + Feature  3 - Users - GET tv watchlist of a user
 + Feature  4 - Users - POST a movie to favourites list of a user (updated)
 + Feature  5 - Users - POST an actor to likes list of a user
 + Feature  6 - Users - POST a TV to watchlist of a user
 + Feature  7 - Movies - POST to create a new movie
 + Feature  8 - Movies - PUT to update information of a movie by movie id
 + Feature  9 - Movies - DELETE a movie by movie id
 + Feature 10 - Movies - GET reviews of a movie by id (updated)
 + Feature 11 - Movies - POST a review to a movie by id (updated)
 + Feature 12 - Movies - GET popular movies list
 + Feature 13 - Movies - GET now playing movies list
 + Feature 14 - Movies - GET top rated movies list
 + Feature 15 - Movies - GET recommendation movies of a movie by movie id
 + Feature 16 - TVs - GET a list of TVs
 + Feature 17 - TVs - GET details of a TV by TV id
 + Feature 18 - TVs - GET reviews of a TV by id
 + Feature 19 - TVs - POST a review to a TV by id
 + Feature 20 - Actors - GET a list of actors
 + Feature 21 - Actors - GET details of an actor by actor id
 + Feature 22 - Build multiple data models: User Model, Movie Model, TV Model, Actor Model, Genre Model and Review Model
 + Feature 23 - Abundant data loads to MongoDB from TMDB API 
 + Feature 24 - Custom validation using Mongoose
 + Feature 25 - Authentication and protected routes using JWT
 + Feature 26 - Use of express middleware, including Error handling and Exceptions
 + Feature 27 - Substantial integration with React App
 + Feature 28 - Cloud MongoDB instead of local DB



## Installation Requirements

Describe what needs to be on the machine to run the API (Node v, NPM, MongoDB instance, any other 3rd party software not in the package.json). 

Getting the software:

```bat
git clone https://github.com/CeciliaChen-2000/Assignment2-MovieAPI.git
```

Install Git

```bat
git install
```
Install node_modules:
```bat
npm install
```
Sopporting modules and pakages (dependencies):
 + "body-parser": "^1.19.1"
 + "dotenv": "^10.0.0"
 + "express": "^4.17.1"
 + "express-async-handler": "^1.2.0"
 + "express-session": "^1.17.2"
 + "jsonwebtoken": "^8.5.1"
 + "mongoose": "^6.0.13"
 + "node-fetch": "^2.6.6"
 + "passport": "^0.5.0"
 + "passport-jwt": "^4.0.0"
 + "uniqid": "^5.4.0"

## API Configuration
Describe any configuration that needs to take place before running the API. 
creating a .env file
```bat
NODE_ENV=development
PORT=8080
HOST=localhost
MONGO_DB=<YourMongoURL>
SEED_DB=true
SECRET=<YourJWTSecret>
TMDB_KEY=<YourTMDBKey>
```

creating a .babelrc file
```bat
{
  "presets": [ "@babel/preset-env" ],
  "plugins": [
    [ "@babel/transform-runtime" ]
  ]
}
```

creating a .gitignore file
```bat
node_modules
build
npm-debug.log
.env
.DS_Store
/**/.DS_S*
```
## API Design
An overview of web API design: 

|  |  GET | POST | PUT | DELETE
| -- | -- | -- | -- | -- 
| /api/movies |Get a list of movies | Post a new movie | N/A | N/A |
| /api/movies/{movieid} | Get a Movie | N/A | Update a movie | Delete a movie |
| /api/movies/{movieid}/reviews | Get all reviews for movie | Create a new review for Movie | N/A | N/A |
| /api/movies/{movieid}/recommendations | Get recommendations of a movie | N/A | N/A | N/A | 
| /api/movies/tmdb/upcoming | Get upcoming movies | N/A | N/A | N/A | 
| /api/movies/tmdb/popular | Get popular movies | N/A | N/A | N/A | 
| /api/movies/tmdb/nowPlaying | Get now playing movies | N/A | N/A | N/A | 
| /api/movies/tmdb/topRated | Get top rated movies | N/A | N/A | N/A | 
| /api/users | Get a list of users | Login or regiater | N/A | N/A | N/A | 
| /api/users/{userid} | N/A | N/A | Update a user | N/A | 
| /api/users/{username} | N/A | N/A | N/A | Delete a user |
| /api/users/{username}/favourites | Get a list of favourite movies | Add a movie to favourites | N/A | N/A |
| /api/users/{username}/likes | Get a list of like actors | Add an actor to likes | N/A | N/A |
| /api/users/{username}/watchlist | Get a TV watchlist | Add a TV to watchlist | N/A | N/A |
| /api/tvs | Get a list of TVs | N/A | N/A | N/A |
| /api/tvs/{tvid} | Get a TV | N/A | N/A | N/A |
| /api/tvs/{tvid}/reviews | Get all reviews for a TV | Create a new review for TV | N/A | N/A |
| /api/actors | Get a list of avtors | N/A | N/A | N/A |
| /api/actors/{actorid} | Get an actor | N/A | N/A | N/A |
| /api/genres | Get a list of genres | N/A | N/A | N/A |


## Security and Authentication
Give details of authentication/ security implemented on the API(e.g. passport/sessions). Indicate which routes are protected.

Session is implemented in the middleware of index.js:
~~~Javascript
app.use(
  session({
    secret: "ilikecake",
    resave: true,
    saveUninitialized: true,
  })
);
~~~
Part of the code to realize the JWT authentication:
~~~Javascript
dotenv.config();

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET;
const strategy = new JWTStrategy(jwtOptions, async (payload, next) => {
  const user = await UserModel.findByUserName(payload);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);
~~~

Protected route: api/actors
~~~Javascript
app.use('/api/actors', passport.authenticate('jwt', {session: false}), actorsRouter);
~~~

## Integrating with React App

Describe how to integrate React App with the API. Perhaps link to the React App repo and give an example of an API call from React App. For example: 

GitHub Repo of React App: 
https://github.com/CeciliaChen-2000/wad2-moviesApp.git

Add proxy to package.json:
```bat
"proxy":"http://localhost:8080"
```
Sign in and sign up integration:
~~~Javascript
export const login = (username, password) => {
    return fetch('/api/users', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json())
};

export const signup = (username, password) => {
    return fetch('/api/users?action=register', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json())
};
~~~

Other integrations:
~~~Javascript
export const getMovies = () => {
  return fetch(
    '/api/movies', {
      headers: {
        'Authorization': window.localStorage.getItem('token')
      }
  }
  ).then(res => res.json());
};

export const getUpcomingMovies = () => {
  return fetch(
    '/api/movies/tmdb/upcoming', {
      headers: {
        'Authorization': window.localStorage.getItem('token')
      }
  }
  ).then(res => res.json());
};

export const getRecommendationsMovies = (args) => {
  const [, idPart] = args.queryKey;
  const { id } = idPart;
  return fetch(
    `/api/movies/${id}/recommendations`, {
    headers: {
      'Authorization': window.localStorage.getItem('token')
    }
  }
  ).then(res => res.json());

  export const getActors = () => {
    return fetch(
      '/api/actors', {
      headers: {
        'Authorization': window.localStorage.getItem('token')
      }
    }
    ).then(res => res.json());
  };
~~~

## Extra features

. . Briefly explain any non-standard features, functional or non-functional, developed for the app.  

## Independent learning

. . State the non-standard aspects of React/Express/Node (or other related technologies) that you researched and applied in this assignment . .  
