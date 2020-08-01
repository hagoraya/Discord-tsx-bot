const { parentPort } = require('worker_threads')
require('dotenv').config();
const mongoose = require('mongoose')
const MONGO_URL = process.env.MONGODB_URI
var connected = false

//Establish connection to DB
async function connectToDB() {
    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(() => {
        connected = true
        console.log("connected to db ")
    }).catch(error => console.log(error))
}



const tickerSchema = new mongoose.Schema({
    name: String,
    occurrences: Number, default: 0
})

var tickerModel = mongoose.model('ticker', tickerSchema);


parentPort.once("message", (ticker) => {
    console.log("Message received", ticker)

    if (connected) {

        new Promise(function (resolve, reject) {
            tickerModel.findOne({ "name": ticker }, function (err, doc) {
                if (doc == null) {
                    //No document was found 
                    var newticker = new tickerModel();
                    newticker.name = ticker
                    newticker.occurrences = 1;

                    newticker.save().then(() => { console.log("added new doc"); resolve() })

                } else {
                    //Doc already exists
                    tickerModel.findOneAndUpdate({
                        name: ticker
                    }, {
                        $inc: { occurrences: 1 }

                    }, function (err, response) {
                        if (err) { return console.log(err) } else { console.log(`Updated ${ticker}`); resolve() }

                    })
                }
            })
        }).then(function (err) {
            if (err) {
                return console.log(err)
            }
            parentPort.postMessage("Data saved successfully")

        }).catch(function (err) { console.log(err) })

    }





});


module.exports.connectToDB = connectToDB;
