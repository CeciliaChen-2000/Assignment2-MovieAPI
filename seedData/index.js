import userModel from '../api/users/userModel';
import users from './users';

import movieModel from '../api/movies/movieModel';
import genreModel from '../api/genres/genreModel';
import actorModel from '../api/actors/actorModel';
import tvModel from '../api/tvs/tvModel';

import { getMovies, getGenres, getActors, getTVs } from '../api/tmdb-api';
import dotenv from 'dotenv';

dotenv.config();

// deletes all user documents in collection and inserts test data
async function loadUsers() {
  console.log('load user Data');
  try {
    await userModel.deleteMany();
    // await userModel.collection.insertMany(users);
    users.forEach(user => userModel.create(user));
    console.info(`${users.length} users were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load user Data: ${err}`);
  }
}

async function loadGenres() {
  console.log('load genre Data');
  try {
    const genres = await getGenres();
    await genreModel.deleteMany();
    await genreModel.collection.insertMany(genres);
    console.info(`${genres.length} genres were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load genre Data: ${err}`);
  }
}

// deletes all movies documents in collection and inserts test data
export async function loadMovies() {
  console.log('load movie data');
  try {
    const movies = await getMovies();
    await movieModel.deleteMany();
    await movieModel.collection.insertMany(movies);
    console.info(`${movies.length} Movies were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load movie Data: ${err}`);
  }
}

export async function loadActors() {
  console.log('load actor data');
  try {
    const actors = await getActors();
    await actorModel.deleteMany();
    await actorModel.collection.insertMany(actors);
    console.info(`${actors.length} Actors were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load actors Data: ${err}`);
  }
}

export async function loadTVs() {
  console.log('load TV data');
  try {
    const tvs = await getTVs();
    await tvModel.deleteMany();
    await tvModel.collection.insertMany(tvs);
    console.info(`${tvs.length} TVs were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load tvs Data: ${err}`);
  }
}

if (process.env.SEED_DB == 'True') {
  loadUsers();
  loadGenres();
  loadMovies();
  loadActors();
  loadTVs();
}