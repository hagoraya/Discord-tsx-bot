require('dotenv').config();
const axios = require('axios')
finnAPI = process.env.FINNHUB_API;



async function getData(ticker) {
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker.toUpperCase()}&token=${finnAPI}`


    let res = await axios.get(url).catch((err) => console.log(err))
    if (!res.data.c) {
        return null;
    } else {

        var StockData = {
            current: res.data.c,
            high: res.data.h,
            low: res.data.l,
            openedAt: res.data.o,
            pervClose: res.data.pc
        }


        return StockData;
    }






}


module.exports.getData = getData;