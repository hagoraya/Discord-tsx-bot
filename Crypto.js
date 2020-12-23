require("dotenv").config();

const axios = require("axios");
const API_KEY = process.env.NOMICS_API;

function formatNumber(num) {
  var number = parseFloat(num);
  return "$" + number.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

async function getData(id) {
  const ticker = id.toUpperCase();
  const cryptodata = {
    symbol: "",
    name: "",
    price: "",
    logo_url: "",
    volume: "",
    market_cap: "",
  };

  const { data } = await axios.get(
    `https://api.nomics.com/v1/currencies/ticker?key=${API_KEY}&ids=${ticker}&interval=1d`
  );

  cryptodata.symbol = data[0].symbol;
  cryptodata.name = data[0].name;
  cryptodata.price = formatNumber(data[0].price);
  cryptodata.logo_url = data[0].logo_url;
  cryptodata.volume = formatNumber(data[0]["1d"].volume);
  cryptodata.market_cap = formatNumber(data[0].market_cap);

  return cryptodata;
}

module.exports.getData = getData;
