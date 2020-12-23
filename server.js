require("dotenv").config();
const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGODB_URI;
let connected = false;

const tickerSchema = new mongoose.Schema({
  name: String,
  occurrences: Number,
  default: 0,
});

var tickerModel = mongoose.model("ticker", tickerSchema);

async function savetoDB(ticker) {
  if (connected) {
    new Promise(function (resolve, reject) {
      tickerModel.findOne({ name: ticker }, function (err, doc) {
        if (doc == null) {
          //No document was found
          var newticker = new tickerModel();
          newticker.name = ticker;
          newticker.occurrences = 1;

          newticker.save().then(() => {
            console.log("added new doc");
            resolve();
          });
        } else {
          //Doc already exists
          tickerModel.findOneAndUpdate(
            {
              name: ticker,
            },
            {
              $inc: { occurrences: 1 },
            },
            function (err, response) {
              if (err) {
                return console.log(err);
              } else {
                console.log(`Updated ${ticker}`);
                resolve();
              }
            }
          );
        }
      });
    })
      .then(function (err) {
        if (err) {
          return console.log(err);
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  } else {
    connected = false;
    return console.log("Database connection not established");
  }
}

async function connectToDB() {
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      connected = true;
    })
    .catch((error) => console.log(error));
}

module.exports.connectToDB = connectToDB;
module.exports.savetoDB = savetoDB;
