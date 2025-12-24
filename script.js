function openModal() {
  document.getElementById("movieModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("movieModal").classList.add("hidden");
}


function openMovie(id, name) {
  window.location.href = `movie_details.html?id=${id}&name=${encodeURIComponent(name)}`;
}


function goBack() {
  window.location.href = "index.html";
}

let jwtToken = null;

function adminLogin() {
  const username = prompt("Enter admin username:");
  const password = prompt("Enter admin password:");

  if (!username || !password) {
    alert("Login cancelled");
    return;
  }

  fetch("https://cooperative-compassion-production.up.railway.app/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
    .then(res => {
      if (res.status === 401) {
        alert("Login failed invalid credencials..!!!")
        throw new Error("Login failed");
      }
      return res.json();
    })
    .then(data => {
      jwtToken = data.token;
     openModal();
    })
}
function addMovie() {
  if (jwtToken === null) {
    // not logged in yet
    adminLogin();
  } else {
    // already logged in
   openModal();
  }
}


function addMovie1() {
  const name = document.getElementById("movieName").value.trim();
  const genre = document.getElementById("movieGenre").value.trim();

  if (!name || !genre) {
    alert("Please fill all fields");
    return;
  }


  fetch("https://cooperative-compassion-production.up.railway.app/movies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + jwtToken
    },
    body: JSON.stringify({
      movieName: name,
      genre: genre
    })
  })
    .then(res => {
      if (res.status === 401) {
        alert("unauthorized");
        return;
      }
      return res.json();
    })
    .then(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `<h3>${movie.movieName}</h3><p>${movie.genre}</p>`;
      card.onclick = () => openMovie(movie.id, movie.movieName);

      document.querySelector(".movie-grid").appendChild(card);
      closeModal();
    });
}




//functions for movie_details


const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
const movieName = params.get("name");

const movieTitle = document.getElementById("movieTitle");
if (movieTitle) {
  movieTitle.innerText = movieName;
}



function openReviewModal() {
  document.getElementById("reviewModal").classList.remove("hidden");
}

function closeReviewModal() {
  document.getElementById("reviewModal").classList.add("hidden");
}



function submitReview() {
  const text = document.getElementById("reviewText").value.trim();
  const rating = document.getElementById("rating").value.trim();
  if (!text) {
    alert("Enter your review");
    return;
  }

  fetch(`https://cooperative-compassion-production.up.railway.app/movies/${movieId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      review: text,
      rating: rating
    })
  })
    .then(res => res.json())
    .then(() => {
      closeReviewModal();
      loadReviews();   // reload from DB
    });
}

function loadReviews() {
  const list = document.getElementById("reviewsList");
  if (!list) return;

  fetch(`https://cooperative-compassion-production.up.railway.app/movies/${movieId}/reviews`)
    .then(res => res.json())
    .then(data => {
      list.innerHTML = "<h2>Reviews</h2>";

      data.forEach(r => {
        const div = document.createElement("div");
        div.className = "review-card";
        div.innerHTML = `
          <p>${r.review}</p>
          <span>${"⭐".repeat(r.rating)}</span>
        `;
        list.appendChild(div);
      });
    });
}

if (movieId) {
  loadReviews();
}


window.onload = () => {
  const grid = document.querySelector(".movie-grid");
  if (!grid) return;

  fetch("https://cooperative-compassion-production.up.railway.app/movies")
    .then(res => res.json())
    .then(data => {
      grid.innerHTML = "";

      data.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        fetch(`https://cooperative-compassion-production.up.railway.app/movies/${movie.id}/stats`)
          .then(res => res.json())
          .then(stats => {
            card.innerHTML = `
      <h3>${movie.movieName}</h3>
      <p>${movie.genre}</p>
      <small>⭐ ${stats.averageRating.toFixed(1)} (${stats.reviewCount} reviews)</small>
    `;
          });

        card.onclick = () => openMovie(movie.id, movie.movieName);
        grid.appendChild(card);
      });
    });
};


