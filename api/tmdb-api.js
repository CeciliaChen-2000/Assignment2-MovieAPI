import fetch from 'node-fetch';

export const getGenres = () => {
    return fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_KEY}&language=en-US`
    )
        .then(res => res.json())
        .then(json => json.genres);
};

export const getMovies = () => {
    return fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_KEY}&language=en-US&include_adult=false&page=1`
    )
        .then(res => res.json())
        .then(json => json.results);
};

export const getActors = () => {
    return fetch(
        `https://api.themoviedb.org/3/person/popular?api_key=${process.env.TMDB_KEY}&language=en-US`
    )
        .then(res => res.json())
        .then(json => json.results);
};

export const getTVs = () => {
    return fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    )
        .then(res => res.json())
        .then(json => json.results);
};

export const getMovieReviews = (movie_id) => {
    return fetch(
        `https://api.themoviedb.org/3/movie/${movie_id}/reviews?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    )
        .then(res => res.json())
        .then(json => json.results);
};

export const getRecommendationMovies = (movie_id) => {
    return fetch(
        `https://api.themoviedb.org/3/movie/${movie_id}/recommendations?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    )
        .then(res => res.json())
};

export const getUpcomingMovies = () => {
    return fetch(
        `https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    )
        .then(res => res.json())
};

export const getPopularMovies = () => {
    return fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    )
        .then(res => res.json())
};

export const getTopRatedMovies = () => {
    return fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    )
        .then(res => res.json())
};

export const getNowPlayingMovies = () => {
    return fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    )
        .then(res => res.json())
};