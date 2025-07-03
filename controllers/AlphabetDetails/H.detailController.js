const express = require("express");
const router = express.Router();
const axios = require("axios");

const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
const BLOCK_HEIGHT_URL = "https://blockstream.info/api/blocks/tip/height";
const NEXT_HALVING_BLOCK = 1050000;

const getHalvingData = async () => {
  const [priceRes, blockRes] = await Promise.all([
    axios.get(COINGECKO_URL),
    axios.get(BLOCK_HEIGHT_URL),
  ]);

  const price = priceRes.data.bitcoin.usd;
  const currentBlock = blockRes.data;
  const blocksRemaining = NEXT_HALVING_BLOCK - currentBlock;
  const estSeconds = blocksRemaining * 10 * 60;

  const years = Math.floor(estSeconds / (365 * 24 * 60 * 60));
  const remainingAfterYears = estSeconds % (365 * 24 * 60 * 60);

  const months = Math.floor(remainingAfterYears / (30 * 24 * 60 * 60));
  const remainingAfterMonths = remainingAfterYears % (30 * 24 * 60 * 60);

  const days = Math.floor(remainingAfterMonths / (24 * 60 * 60));
  const remainingAfterDays = remainingAfterMonths % (24 * 60 * 60);

  const hours = Math.floor(remainingAfterDays / (60 * 60));
  const minutes = Math.floor((remainingAfterDays % (60 * 60)) / 60);
  const seconds = remainingAfterDays % 60;

  const estimatedTime = {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  };

  return {
    price,
    currentBlock,
    blocksRemaining,
    estimatedTime,
  };
};

// Define route using router instead of app
router.get("/halving", async (req, res) => {
  try {
    const data = await getHalvingData();
    res.status(200).json({ data, message: "Halving data fetched successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch halving data" });
  }
});

module.exports = router;
