const cheerio = require('cheerio')
const axios = require('axios')




async function startScraper(url) {
    let res = await fetchData(url);
    if (!res.data) {
        Console.error("Invalid data object")
        return null;

    }
    const html = res.data;
    const stockdata = extractStockData(html);
    return stockdata;

}



async function fetchData(url) {
    console.log(`Crawling: ${url}`);
    //make a http call to url
    let response = await axios(url).catch((err) => console.log(err))

    if (response.status !== 200) {
        console.log("Error fetching data")
        return;
    }

    return response;

}


function extractStockData(html) {
    const $ = cheerio.load(html)
    var StockData = {
        companyName: '',
        exchange: '',
        price: '',
        symbol: '',
        percentChange: '',
        high52: '',
        low52: '',
    }


    if ($(html).find('.quote-company-name ').length < 1) {
        return null
    }


    $('.quote-company-name ', html).each(function (i, item) {
        StockData.companyName = $("H4", item).text().trim()
    })

    $('.blurb.text-darkgrey', html).each(function (i, item) {
        StockData.exchange = $(".text-darkgrey", item).text().trim()
    })

    $('.price', html).each(function (i, item) {
        StockData.price = $("span", item).text().trim()
    })

    StockData.symbol = $('.labs-symbol', html).first().contents().filter(function () {
        return this.type === 'text';
    }).text().trim()


    StockData.high52 = $('.week-high', html).first().contents().filter(function () {
        return this.type === 'text'
    }).text().trim()

    StockData.low52 = $('.week-low', html).first().contents().filter(function () {
        return this.type === 'text'
    }).text().trim()


    $('.text-red, .text-green, .change-off', html).each(function (i, item) {
        if (item.name === 'strong') {
            var content = item.children[0].data.trim();
            var arr = content.split('\n')
            var finalResult = arr[1].replace(/\t/g, '').toString();
            finalResult = finalResult.substring(1, finalResult.length - 2)
            StockData.percentChange = finalResult
        }
    })


    return StockData;

}



module.exports.startScraper = startScraper;