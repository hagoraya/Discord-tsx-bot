const puppeteer = require('puppeteer');
const $ = require('cheerio')



//Run Scraper

async function configBrower(url) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    return page;

}

async function getData(page) {
    await page.reload();

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
    console.log("Running Scraper")
    let page = await configBrower(url);
    const StockData = await getData(page);
    return StockData
}

module.exports.monitor = monitor; 