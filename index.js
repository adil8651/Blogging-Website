import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "blog",
  password: "",
  port: 5432,
});

db.connect();
// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM posts");
    res.render("index.ejs", { posts: response.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Route to render the edit page
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

app.get("/edit/:id", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Create a new post
app.post("/api/posts", async (req, res) => {
  try {
    const response = await db.query(
      "INSERT INTO posts(title, content, author, date) VALUES ($1, $2, $3, $4) RETURNING title, content, author, date",
      [req.body.title, req.body.content, req.body.author, new Date()]
    );
    console.log(response.rows);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// Partially update a post
app.post("/api/posts/:id", async (req, res) => {
  console.log("called");
  try {
    const response = await db.query(
      "UPDATE posts SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING title, content, author",
      [req.body.title, req.body.content, req.body.author, req.params.id]
    );
    console.log(response.rows);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
