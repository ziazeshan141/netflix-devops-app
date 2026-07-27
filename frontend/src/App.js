import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios
      .get("/api/movies")
      .then((res) => setMovies(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "30px", background: "#141414", minHeight: "100vh", color: "white" }}>
      <h1>Netflix DevOps</h1>

      {movies.map((movie) => (
        <div key={movie.id}>
          <h3>{movie.title}</h3>
          <p>Year: {movie.year}</p>
          <p>Rating: {movie.rating}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
