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

module.exports = router;
