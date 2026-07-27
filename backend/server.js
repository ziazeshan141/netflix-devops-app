const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const movies = [
  {
    id: 1,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0
  },
  {
    id: 2,
    title: "Inception",
    year: 2010,
    rating: 8.8
  },
  {
    id: 3,
    title: "Interstellar",
    year: 2014,
    rating: 8.7
  }
];

app.get("/", (req, res) => {
  res.send("Netflix DevOps Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "UP",
    application: "Netflix Backend"
  });
});

app.get("/api/movies", (req, res) => {
  res.json(movies);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
