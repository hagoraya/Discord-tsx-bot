require('dotenv').config();
const Discord = require('discord.js')
const bot = new Discord.Client();
const Database = require('./server')
const YahooScraper = require('./BETA/YahooScraper')

const PREFIX = '$$'



var queue = [];

const TOKEN = process.env.DISCORD_TOKEN



bot.on('ready', () => {
    bot.user.setActivity('| $$<Ticker>', { type: 'WATCHING', url: 'https://github.com/hagoraya/Discord-tsx-bot' })
    console.log('TSX Bot is online')
    Database.connectToDB().then(() => { console.log("Database connection established") })
    main()
})



async function main() {

    bot.on('message', (msg) => {

        //Ignore if the msg was sent by the bot
        if (msg.author.bot) { return; }

        //Ignore the msg if it was sent in the dms
        if (msg.channel.type === 'dms') { return; }

        if (msg.content.startsWith(PREFIX)) {

            const symbol = msg.content.substr(2)
            queue.push(symbol)

            while (queue.length > 0) {
                const URL = `https://web.tmxmoney.com/company.php?qm_symbol=${queue.shift()}`

                YahooScraper.startScraper(symbol).then((ydata) => {
                    if (ydata) {

                        //console.log("Yahoo Data: ", ydata)

                        let embed = new Discord.MessageEmbed()
                            .setColor('#85bb65')
                            .setTitle(`${symbol.toUpperCase()}`)
                            .addFields(
                                { name: 'Company', value: `${ydata.companyName}` },
                                { name: 'Current Price', value: `${ydata.currentPrice}` },
                                { name: 'Change', value: `${ydata.change}` },
                                { name: '52 Week Range', value: `${ydata.range52}` },
                                { name: 'More Info', value: `${ydata.link}` }
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


bot.login(TOKEN);
