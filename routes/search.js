require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  });

  const response = await axios.post(
    "https://api.petfinder.com/v2/oauth2/token",
    params,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return response.data.access_token;
}

router.get("/search", async (req, res) => {
  const { location } = req.query;
  const type = "Dog";
  if (!location) return res.redirect("/");

  try {
    const token = await getAccessToken();
    const apiRes = await axios.get("https://api.petfinder.com/v2/animals", {
      headers: { Authorization: `Bearer ${token}` },
      params: { type, location, limit: 10 },
    });

    const dogs = apiRes.data.animals;
    res.render("results", { dogs });
  } catch (err) {
    console.error(err);
    res.status(500).send("api error");
  }
});

router.post("/likes/:id", (req, res) => {
  // credit for line 47 below: https://stackoverflow.com/questions/12442716/res-redirectback-with-parameters
  backURL = req.header("Referer") || "/";
  const dogId = req.params.id;

  if (!req.session.likedDogs) {
    req.session.likedDogs = [];
  }

  if (!req.session.likedDogs.includes(dogId)) {
    req.session.likedDogs.push(dogId);
  }

  res.redirect(backURL);
});

router.post("/unlikes/:id", (req, res) => {
  // credit for line 63 below: https://stackoverflow.com/questions/12442716/res-redirectback-with-parameters
  backURL = req.header("Referer") || "/";
  const dogId = req.params.id;

  req.session.likedDogs = req.session.likedDogs || [];

  req.session.likedDogs = req.session.likedDogs.filter((id) => id !== dogId);

  res.redirect(backURL);
});

router.get("/likes", async (req, res) => {
  const likedIds = req.session.likedDogs || [];

  if (likedIds.length === 0) {
    return res.render("matches", { dogs: [] });
  }

  try {
    const token = await getAccessToken();

    const getDogs = likedIds.map((id) =>
      axios.get(`https://api.petfinder.com/v2/animals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    const responses = await Promise.all(getDogs);
    const dogs = responses.map((r) => r.data.animal);

    res.render("matches", { dogs });
  } catch (error) {
    console.error("failed to get liked dogs");
    res.status(500).send("couldnt get liked dogs");
  }
});

module.exports = router;
