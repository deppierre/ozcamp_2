const request = require("request-promise")
const cheerio = require("cheerio")
const fs = require("fs")
const env = require('dotenv').config()

const { MongoClient, ServerApiVersion } = require('mongodb');
const { map } = require("cheerio/lib/api/traversing");
const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9,es;q=0.8"
};

//NP campings
function getCampings(parks) {
    for (const [key, value] of parks.entries()) {
        request({
            uri: value.link,
            headers: headers,
            gzip: true,
        }, function (err, res, body) {
            if (err) return console.error(err);
            let $ = cheerio.load(body);

            $(".scrollingBox__item.camping h3 a").get().map(ele => {
                value.campings.push({
                    name: $(ele).text(),
                    link: $(ele).attr('href')
                })
                console.log(`getCampings::New camping added (${$(ele).text()})`)
            });
        });
    }
}

//National Parks
function getNationalParks(callback) {
    request({
        uri: process.env.PARKS,
        headers: headers,
        gzip: true,
    }, function (err, res, body) {
        if (err) return console.error(err);

        let $ = cheerio.load(body);    
        let parks = $(".dynamicListing li a").get().map(ele => {
            const link = $(ele).attr('href');
            return {
                ParkName: $(ele).text(),
                link: link,
                campings: []
            }
        });
        callback(parks);
    });
};

function insertMany(documents){
    //MongoDB
    const uri = process.env.URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    const mycoll = "parks";

    client.connect( async function(err, db) {
        if (err) throw err;

        try{
            await client.db().dropCollection(mycoll);
            console.log(`refreshParkList::Collection ${mycoll} deleted`);
        } catch(err) {
            if (err.codeName == 'NamespaceNotFound') {
                console.log(`refreshParkList::Collection ${mycoll} already deleted`)
            }
        } finally{
            let result = await client.db().collection(mycoll).insertMany(parks);
            console.log(`refreshParkList::${result.insertedCount} parks created`);
            client.close();
        }
    });
}

getNationalParks(getCampings);
// getCampings(insertMany);