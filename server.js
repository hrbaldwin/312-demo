const express = require("express");
const app = express();
const PORT = 3000;

const session = require("express-session");

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "8080abc",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  console.log("howdy world");
  res.render("index");
});

const searchRoutes = require("./routes/search");
app.use("/", searchRoutes);

app.listen(PORT);
