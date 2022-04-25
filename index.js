const request = require("request-promise")
const cheerio = require("cheerio")
const fs = require("fs")
const env = require('dotenv').config()

const { MongoClient, ServerApiVersion } = require('mongodb');

//National Parks
async function refreshParkList(client) {
    var parks = [];
    var mycoll = "parks";
    const headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,es;q=0.8"
    };

    var response = await request({
        uri: process.env.PARKS,
        headers: headers,
        gzip: true,
    });

    var $ = cheerio.load(response);

    $(".dynamicListing li a").each(function (idx, el) {
        var ParkName = $(el).text();
        var link = $(el).attr('href');
    
        parks.push(
            { 
                ParkName: ParkName,
                type: "National Park",
                "url": link,
                "campings": []
            }
        );
    });

    //Camping URL
    parks.forEach(async function (mypark, index, arr) {
        var response = await request({
            uri: mypark.url,
            headers: headers,
            gzip: true,
        });

        var $ = cheerio.load(response);

        $(".scrollingBox__item a").each(async function (idx, el) {
            var link = $(el).attr('href');
            await parks[index].campings.push(link);
        });
        console.log(parks);
    });
        // $(".scrollingBox__item").each(function (idx, el) {
        //     var name = $(el).text();
        //     var link = $(el).attr('href');

        //     console.log(`${name} ${link}`);
        // });  

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
    }
}

async function main() {    
    //MongoDB
    const uri = process.env.URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();

    try {
        await refreshParkList(client);
    } finally {
        await client.close();
    }
}

main().catch(console.error);