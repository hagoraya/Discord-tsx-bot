const puppeteer = require('puppeteer');
const $ = require('cheerio')


//Run Scraper

async function configBrower(url) {


    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--single-process'] });
        const page = await browser.newPage();
        await page.goto(url);
        return [page, browser];

    } catch (error) {
        console.log("Error in configBrower", error);
    }


}

async function getData(page) {
    try {
        await page.reload();

    } catch (error) {
        console.log("Error whole page reload", error)
    }

    let html = await page.evaluate(() => document.body.innerHTML);
    // console.log(html)

    var StockData = {
        companyName: '',
        exchange: '',
        price: '',
        symbol: '',
        high52: '',
        low52: '',
    }

    //If invalid symbol


    // console.log($(html).find('.quote-company-name ').length)

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

    //console.log("Stock Data: \n", StockData)



    return StockData
}


async function monitor(url) {
    console.log(`Running Scraper with ${url}`)



    try {
        let values = await configBrower(url);
        var page = values[0];
        var brow = values[1];
    } catch (error) {
        console.log("Error setting configs for browser", error)
    }







    const StockData = await getData(page);



    try {
        page.close().then(d => brow.close())
    } catch (error) {
        console.log("Error closing page or browser", error)
    }



    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Scraper used ${Math.round(used * 100) / 100} MB`);
    return StockData
}

module.exports.monitor = monitor; 