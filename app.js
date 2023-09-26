const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initilizeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//Get all movies

app.get("/movies/", async (request, response) => {
  const allMovies = `
    SELECT movie_name
    FROM
    movie`;
  const moviesArray = await db.all(allMovies);
  response.send(
    moviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Add a Movie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
         '${directorId}',
         '${movieName}',
         '${leadActor}'
      );`;
  const dbResponse = await db.run(addMovie);
  const final_1 = convertDbObjectToResponseObject(dbResponse);
  response.send("Movie Successfully Added");
});

//Get a Single Movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT
    *
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  const movieArray = await db.get(getMovie);
  response.send(convertDbObjectToResponseObject(movieArray));
});

//Update a Movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieInfo = `
    UPDATE
      movie
    SET
      movie_name='${movieName}',
      director_id='${directorId}',
      lead_actor='${leadActor}'
    WHERE
      movie_id = '${movieId}';`;
  const final = await db.run(movieInfo);
  const final_1 = convertDbObjectToResponseObject(final);
  response.send("Movie Details Updated");
});

//Delete a Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
      movie
    WHERE
      movie_id = '${movieId}';`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//All directors

app.get("/directors/", async (request, response) => {
  const allDirectors = `
    SELECT *
    FROM
    director`;
  const directorArray = await db.all(allDirectors);
  response.send(
    directorArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Get all Movies from a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const allMovies = `
    SELECT movie_name
    FROM
    movie NATURAL JOIN
    director
    WHERE
    movie.director_id = director.director_id AND director_id = ${directorId}`;
  const movieArray = await db.all(allMovies);
  response.send(
    movieArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

module.exports = app;