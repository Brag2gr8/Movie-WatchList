let inputEl = document.getElementById("input");
const movieTray = document.getElementById("movies");
const watchlistEl = document.getElementById("watchlist")
const movieArray = [];
let watchlistMovieArray = [];

if (localStorage.getItem('watchlist')) {
    watchlistMovieArray = JSON.parse(localStorage.getItem('watchlist'))
}

// SEARCH FOR MOVIE WHEN ENTER BUTTON IS CLICKED
if (inputEl){
    inputEl.addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
            document.getElementById("search").click()
        }
    })
}

// ADD LISTENER TO WHOLE DOCUMENT FOR SPECIFIC ID 
document.addEventListener("click", (e) => {
    if (e.target.id === "add") {
        handleAdd(e.target.dataset.id)
    } else if (e.target.id === "search") {
        renderMovie()
    } else if (e.target.id === "remove") {
        handleRemove(e.target.dataset.id)
    };
});

// CALLS FUNCTIONS NEEDED TO RENDER LIST OF MOVIES RELATING TO INPUT VALUE
async function renderMovie() {
    loading();
    await getMovieArray(inputEl.value);
    inputEl.value = ``;
    movieTray.innerHTML = movieArray.length > 0 ? getMovieHtml() : 
    getNoMovieHtml();
}

//  RENDERS LOADING GIF AND TEXT TO PAGE WHILE WAITING FOR PROMISE
function loading() {
    movieTray.innerHTML = `
        <div class="loading-div">
            <img src="/img/loading.gif" class="loading" />
            <h2 class="loading-text">Searching for your movie</h2>
        </div>`;
};

// TAKES AN INPUT VALUE AND PUSH LIST OF MOVIE TO MOVIE ARRAY AT TOP
async function getMovieArray(value) {
    const res = await fetch(`https://www.omdbapi.com/?apikey=3d2d536a&s=${value}`);
    const data = await res.json();
    movieArray.length = 0;
    if (!data.Error) {
        // HOLDS AN ARRAY FOR ALL RETURNED MOVIE ID
        const movieIdArray = data.Search.map((movie) => {
            return movie.imdbID;
        });
        // CALLS THE FUNCTION FOR THE ARRAY OF ALL RETURNED MOVIE ID
        const movieList = await searchEachMovie(movieIdArray);
        // PUSH ALL MOVIE RETURNED FROM SEARCH TO THE MOVIE ARRAY AT THE TOP
        movieArray.push(...movieList);
    };
};

/*  TAKES AN ARRAY OF MOVIE ID LOOPS THROUGH AND RETURN SEARCH 
 RESULTS FOR ALL ID FROM THE API */
async function searchEachMovie(arr) {
    const finalData = [];
    for(let id of arr) {
        // CALLS THE FUNCTION FOR EACH ID IN THE PASSED ARRAY 
         const data = await searchMovieById(id);
         finalData.push(data);
    };
    return finalData;
};

// TAKES A MOVIE ID AND RETURN SEARCH RESULT FROM API
async function searchMovieById(id) {
    const res = await fetch(`https://www.omdbapi.com/?apikey=3d2d536a&i=${id}`);
    const data = await res.json();
    return data;
}

// LOOPS THROUGH MOVIE ARRAY AND RETURNS HTML FOR EACH MOVIE
function getMovieHtml() {
    let html = ``;
    movieArray.map((movie) => {
        const {Title, imdbID, Year, Runtime, Genre, imdbRating, Plot, Poster} = movie;
        let watchEl = '';
        
        if (isWatchlist(imdbID)) {
            watchEl = `<span class="added">Added to watchList</span>`;
        } else {
            watchEl = `<img src="/img/add.png" data-id=${imdbID} id="add" class="add"/>
            <span>Watchlist</span>`;
        };
        
        html += `
            <div class="movie">
                <img src="${Poster}" class="avatar">
                <div>
                    <div class="movie-name">
                        <h3>${Title} ${Year}</h3>
                        <span>⭐️</span> <span>${imdbRating}</span>
                    </div>
                    <div class="movie-details">
                        <span>${Runtime}</span>
                        <span>${Genre}</span>
                        <div class="watchlist" id=${imdbID} >
                        ${watchEl}
                        </div>
                    </div>
                    <p class="description">${Plot}</p>
                </div>
            </div>
            <hr>`
    });
    return  html;
}
// RETURNS HTML WHEN SEARCH RESULT CAN'T BE FOUND
function getNoMovieHtml() {
    return  `
        <h2 class="no-movie">Unable to find what you’re looking for. 
        Please try another search.</h2>`
};

// CHECK IF MOVIE IS IN WATCHLIST
function isWatchlist(id) {
    let checkIdArray = []
    watchlistMovieArray.forEach(movie => checkIdArray.push(movie.imdbID))
    return checkIdArray.includes(id)
};

// ADDS MOVIE TO WATCHLIST
async function handleAdd(id) {
    const movie = await searchMovieById(id)
    watchlistMovieArray.unshift(movie)
    localStorage.setItem('watchlist', JSON.stringify(watchlistMovieArray))
    document.getElementById(id).innerHTML = `
        <span class="added" >Added to watchList</span>`
}

// RENDERS WATCHLIST MOVIES
async function renderWatchList() {
    if(watchlistMovieArray.length > 0 && watchlistEl ) {
        watchlistEl.innerHTML = getWatchlistHtml();   
    } else if(watchlistEl && watchlistMovieArray.length === 0 ) {
        watchlistEl.innerHTML = `<div class="saved">
                <h2 class="no-movie">Your watchlist is looking a little empty...</h2>
                <div>
                    <a href="/index.html"><img src="/img/add.png" class="add" /></a>
                    <span>Let’s add some movies!</span>
                </div>
            </div>`
    }
};

// LOOPS THROUGH WATCHLIST ARRAY AND RETURNS HTML FOR EVERY
function getWatchlistHtml() {
    let html = "";
    watchlistMovieArray.map((movie) => {
        const {Title, imdbID, Year, Runtime, Genre, imdbRating, Plot, Poster} = movie;
        html += `
        <div class="movie">
            <img src="${Poster}" class="avatar">
            <div>
                <div class="movie-name">
                    <h3>${Title} ${Year}</h3>
                    <span>⭐️ ${imdbRating}</span>
                </div>
                <div class="movie-details">
                    <span>${Runtime}</span>
                    <span>${Genre}</span>
                    <div class="watchlist">
                        <img src="/img/remove.png" class="add" id="remove" data-id=${imdbID} />
                        <span>Remove</span>
                    </div>
                </div>
                <p class="description">${Plot}</p>
            </div>
        </div><hr>`
    });
    
    return html;
}

// REMOVES MOVIE FROM WATCHLIST
function handleRemove(id) {
    let neededIndex;
    watchlistMovieArray.forEach((movie, index) => {
        if (movie.imdbID === id) {
            neededIndex = index;
        };
    });
    watchlistMovieArray.splice(neededIndex, 1);
    localStorage.setItem('watchlist', JSON.stringify(watchlistMovieArray))
    renderWatchList()
}

renderWatchList();