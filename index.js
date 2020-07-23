require('dotenv').config();
const Discord = require('discord.js')
const bot = new Discord.Client();
const Scraper = require('./Scraper')


const TOKEN = process.env.DISCORD_TOKEN
const regex = /^\$\w+$/



bot.on('ready', () => {
    console.log('TSX Bot is online')
    main()
})



function main() {

    bot.on('message', (msg) => {
        //console.log(msg.content)
        if (validTicker(msg.content)) {
            const symbol = msg.content.substr(1)

            const URL = `https://web.tmxmoney.com/company.php?qm_symbol=${symbol}`



            Scraper.monitor(URL).then((data) => {
                // console.log('Date from Scraper: \n', data)
                if (data) {
                    msg.reply(`\`\`\`${data.companyName}\n\nCurrent Price: $${data.price}\n52 Week High: $${data.high52}\n52 Week Low: $${data.low52} \`\`\`
                `)
                } else {
                    msg.reply(`Cannot find \`${symbol}\` on TSX`)
                }


            })

        }
    })


}



function priceFormat(price) {
    var prce = parseFloat(price)
    prce.toFixed(2)
    return prce
}

function validTicker(ticker) {
    //console.log(ticker)
    return regex.exec(ticker)

}

bot.login(TOKEN);

