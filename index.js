require('dotenv').config();
const Discord = require('discord.js')
const bot = new Discord.Client();
const Scraper = require('./Scraper')
const Database = require('./server')

const PREFIX = '$$'



var queue = [];

const TOKEN = process.env.DISCORD_TOKEN
const regex = /[A-Za-z.]+/g;



bot.on('ready', () => {
    bot.user.setActivity('| $$<Ticker>', { type: 'WATCHING', url: 'https://github.com/hagoraya/Discord-tsx-bot' })
    console.log('TSX Bot is online')
    Database.connectToDB().then(
        console.log("Connected to Database")
    )
    main()
})



async function main() {

    bot.on('message', (msg) => {

        //Ignore if the msg was sent by the bot
        if (msg.author.bot) { return; }

        //Ignore the msg if it was sent in the dms
        if (msg.channel.type === 'dms') { return; }

        if (msg.content.startsWith(PREFIX) && validTicker(msg.content.substr(2))) {

            const symbol = msg.content.substr(2)
            queue.push(symbol)

            while (queue.length > 0) {
                const URL = `https://web.tmxmoney.com/company.php?qm_symbol=${queue.shift()}`



                Scraper.monitor(URL).then((data) => {
                    if (data) {
                        // msg.reply(`\`\`\`${data.companyName}\n\nCurrent Price: $${data.price}\n52 Week High: $${data.high52}\n52 Week Low: $${data.low52} \`\`\``)

                        let embed = new Discord.MessageEmbed()
                            .setColor('#85bb65')
                            .setTitle(`${symbol.toUpperCase()}`)
                            .setURL(`${URL}`)
                            .addFields(
                                { name: 'Company Name', value: `${data.companyName}` },
                                { name: 'Current Price', value: `${data.price}` },
                                { name: 'Change', value: `${data.percentChange}%` },
                                { name: '52 Week High', value: `${data.high52}` },
                                { name: '52 Week Low', value: `${data.low52}` },
                                { name: 'TSX Link', value: `${URL}` }

                            )
                            .setTimestamp()


                        Database.savetoDB(symbol.toLowerCase())

                        msg.reply(embed)
                    } else {
                        msg.reply(`Cannot find \`${symbol}\` on TSX`)
                    }
                })

            }






        }

    })


}




function validTicker(ticker) {
    //console.log(ticker)
    return regex.exec(ticker)

}

bot.login(TOKEN);
