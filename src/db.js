let sqlite3 = require('sqlite3').verbose();
var sqlite = require('sqlite-sync');
let _ = require("ramda");

// --- new code --
sqlite.connect('./who_am_i.db');

sqlite.run("CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT, time TEXT)", function(res){
	if(res.error)
		throw res.error;
});

let addMovie = (title, url, time) => {
  sqlite.run(`INSERT INTO movies (title, url, time) VALUES ('${title}', '${url}', '${time}')`);
};

let removeMovie = (id) => {
	sqlite.run(`DELETE FROM movies WHERE id='${id}'`);
}

let getMoviesFromDb = () => {
  return function() {

    let movies = []
    movies = sqlite.run("SELECT * FROM movies");

    return movies;
  }
}

let getMovies = getMoviesFromDb();

module.exports = {
  addMovie,
  getMovies,
	removeMovie
}
