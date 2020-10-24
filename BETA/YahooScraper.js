const cheerio = require('cheerio')
const axios = require('axios')


const URL = 'https://ca.finance.yahoo.com/quote/'
const TO_EXT = '.TO'
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'

function getHTML(url) {

    return axios.get(url,
        {
            timeout: 5000,
            headers: {
                'Content-Type': 'text/html',
                'user-agent': `${USER_AGENT}`
            }
        })
        .then(response => {
            //console.log(response.data)
            return response.data
        })
        .catch(error => { console.log(error); return null })

}

async function getData(url) {

    var StockData = {
        companyName: '',
        currentPrice: '',
        change: '',
        range52: '',
        dayRange: '',
        link: ''
    }


    await getHTML(url).then((html) => {
        const $ = cheerio.load(html)



        if ($(html).find('#quote-header-info').length < 1) {
            // console.log('Cannot find this stock')
            return null
        }


        //To get general stock information
        $('#quote-header-info', html).each(function (i, item) {
            StockData.companyName = $('h1[data-reactid="7"]', item).text()
            StockData.currentPrice = $('span[data-reactid="20"]', item).text()
            StockData.change = $('span[data-reactid="22"]', item).text()
        })

        //To get extra information
        $('div[data-test="left-summary-table"] > table > tbody', html).each(function (i, item) {
            StockData.range52 = $('tr  > td[data-test="FIFTY_TWO_WK_RANGE-value"]', item).text()
            StockData.dayRange = $('tr > td[data-test="DAYS_RANGE-value"]', item).text()

        })

        StockData.link = url

    });


    return StockData;


}


function EmptyCheck(data) {
    if (data.companyName === '' || data.currentPrice === '') { return true; }
    return false;
}


async function startScraper(ticker) {

    const yahooURl = `${URL}${ticker}`
    console.log('Yahoo Scraping: ' + yahooURl)

    // console.time('scraper')
    let data = await getData(yahooURl)

    const tickerExpention = `${yahooURl}${TO_EXT}`

    if (EmptyCheck(data)) {
        console.log(`Stock not found, trying again with ${tickerExpention}`)
        //Scrape again but with .TO extension
        data = await getData(tickerExpention)
        if (EmptyCheck(data)) { console.log('Stock not found, trying again'); return null }

    }

    // console.timeEnd('scraper')


    // console.log(data)

    return data;

}





module.exports.startScraper = startScraper;