const express = require("express");
const axios = require("axios");
const router = express.Router();

// Local Maharashtra fallback data
const fallbackData = require("../data/maharashtra.json");

// GET /mandi
router.get("/mandi", async (req, res) => {
  const { crop } = req.query; // User input
  let mandiRates = [];
  let apiError = false;

  try {
    if (crop) {
      // API request
      const response = await axios.get(process.env.MANDI_BASE_URL, {
        params: {
          "api-key": process.env.MANDI_API_KEY,
          format: "json",
          "filters[commodity]": crop,
          limit: 5
        },
        timeout: 15000 // 15 seconds
      });

      // API data filtered for Maharashtra
      mandiRates = (response.data.records || []).filter(
        r => r.state && r.state.toLowerCase() === "maharashtra"
      );

    //   console.log("FIRST RATE FROM API 👉", mandiRates[0]);
    }
  } catch (err) {
    console.error("MANDI API ERROR:", err.message);
    apiError = true;
  }

  // If API returns empty → fallback JSON
  if (mandiRates.length === 0 && crop) {
    mandiRates = fallbackData.filter(
      r => r.commodity.toLowerCase() === crop.toLowerCase()
    );
  }

  res.render("pages/mandi", {
    mandiRates,
    selectedCrop: crop || "",
    apiError
  });
});

module.exports = router;
