const cheerio = require('cheerio')
const axios = require('axios')


const URL = 'https://ca.finance.yahoo.com/quote/'

function getHTML(url) {

    return axios.get(url, { timeout: 5000 })
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
        range52: 'N/A',
        link: ''
    }

    await getHTML(url).then((html) => {
        const $ = cheerio.load(html)

        if ($(html).find('#quote-header-info').length < 1) {
            console.log('Cannot find this stock')
            return null
        }


        //To get general stock information
        $('#quote-header-info', html).each(function (i, item) {
            StockData.companyName = $('h1[data-reactid="7"]', item).text()
            StockData.currentPrice = $('span[data-reactid="32"]', item).text()
            StockData.change = $('span[data-reactid="33"]', item).text()
        })

        //To get extra information
        $('div[data-test="left-summary-table"] > table > tbody', html).each(function (i, item) {
            StockData.range52 = $('tr  > td[data-test="FIFTY_TWO_WK_RANGE-value"]', item).text()

        })

        StockData.link = url

    });

    return StockData;


}



async function startScraper(ticker) {

    const yahooURl = `${URL}${ticker}`
    console.log('Yahoo Scraping: ' + yahooURl)
    let data = await getData(yahooURl)


    console.log(data)

    //  return data;

}


startScraper('well.to')

module.exports.startScraper = startScraper;