let _   = require("ramda");
let opn = require("opn");
let {
  addMovie,
  getMovies,
  removeMovie
} = require("./db.js");


let clearList = (list) => {
  while(list.childNodes.length) {
    list.removeChild(list.lastChild);
  }
}

// element, text -> domElement
let createDOMElement = _.curry((element, text) => {
  let DOMElement = document.createElement(element);
  DOMElement.textContent = text;
  return DOMElement;
});

// text -> headline
let createHeadline = createDOMElement("H2");

// text -> link
let createLink = createDOMElement("A");

let createTime = createDOMElement("TIME");

let createButton = createDOMElement("BUTTON");


// link -> preventedLink
let openLinkInBrowser = (linkObj) => {
  linkObj.addEventListener("click", (e) => {
    e.preventDefault();
    opn(linkObj.href);
  })

  return linkObj;
}

let addDeleteFunction = (button) => {
  button.addEventListener("click", () => {
    removeMovie(button.getAttribute("data-key"));
    let movies = getMovies();
    renderMovieList(movies);
  });
  return button;
}

let checkTypeOfLink = (movie) => {
  if(movie.url.search("youtube") != -1) {
    let splittedTime = movie.time.split(":");
    let timeQuery = "";
    if(splittedTime.length == 2) {
      timeQuery = `${splittedTime[0]}m${splittedTime[1]}s`;
    } else if(splittedTime.length == 3) {
      timeQuery = `${splittedTime[0]}h${splittedTime[1]}m${splittedTime[2]}s`;
    }

    if(movie.url.search("/?/") == -1) {
      return `${movie.url}?t=${timeQuery}`;
    } else {
      return `${movie.url}&t=${timeQuery}`;
    }

  } else {
    return movie.url;
  }

}

let renderList = _.curry((list, movies) => {
  clearList(list);

  movies.forEach((movie) => {
    let container = document.createElement("LI");

    let title = createHeadline(movie.title);
    // check if this is YT link
    let checkedURL = checkTypeOfLink(movie);

    let url = createLink(checkedURL);
    url.href = checkedURL;
    // prevent default opening
    url = openLinkInBrowser(url);

    let time = createTime(movie.time);

    let deleteButton = createButton("Delete");
    deleteButton.className = "movies-list__delete-button";
    deleteButton.setAttribute("data-key", movie.id);
    deleteButton = addDeleteFunction(deleteButton);

    container.appendChild(title);
    container.appendChild(url);
    container.appendChild(time);
    container.appendChild(deleteButton);
    list.appendChild(container);
  });
});

let validateTime = (time) => {
  let nans = time.split("").filter((t) => isNaN(t) && t != ':');
  return nans.length > 0 ? false : true;
}

let validateTyping = (event) => {
  event.preventDefault();
  if(!isNaN(event.key) || event.key === ':' || event.key === "Backspace") {
    if(event.key === "Backspace") {
      event.target.value = event.target.value.slice(0, event.target.value.length - 1)
    } else {
      event.target.value += event.key;
    }
  }
}

// ------

let moviesForm = document.querySelector("#moviesForm");
let moviesTime = document.querySelector("#time");

let movies = [];
movies = getMovies();
// addMovie("tvgry", "https://www.youtube.com/watch?v=dIoFUsq_Fao", "1:25")
let renderMovieList = renderList(document.querySelector("#moviesList"));

let submitForm = (event) => {
  event.preventDefault();
  let form = event.target;
  // validation
  let validationErrors = [];
  if(!validateTime(form["time"].value)) {
    validationErrors.push("wrong time format")
  }
  if(!form["title"].value.length) {
    validationErrors.push("title can't be empty")
  }

  if(!form["time"].value.length) {
    validationErrors.push("time can't be empty")
  }

  if(!validationErrors.length) {
    addMovie(form["title"].value, form["url"].value, form["time"].value);
    let movies = getMovies();
    renderMovieList(_.reverse(movies));
    form.reset();
  } else {
    let errors = validationErrors.reduce((acc, curr) => {
      return acc.concat(`, ${curr}`);
    }, "")
    alert(errors.slice(2, errors.length));
  }

}



moviesForm.addEventListener("submit", submitForm);
moviesTime.addEventListener("keydown", validateTyping);


renderMovieList(_.reverse(movies));

let burger = document.querySelector("#burger");
burger.addEventListener("click", () => {
  moviesForm.classList.toggle("movie-details--opened");
});
