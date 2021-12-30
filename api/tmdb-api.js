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

export const getUpcomingMovies = () => {
    return fetch(
        `https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(response.json().message);
        }
        return response.json();
    })
        .catch((error) => {
            throw error
        });
};