const cheerio = require("cheerio")
const axios = require("axios")
const env = require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

var start = new Date()
var hrstart = process.hrtime()
var simulateTime = 5

function getExecutionTime(){
    setTimeout(function (argument) {
        // execution time simulated with setTimeout function
        var end = new Date() - start,
        hrend = process.hrtime(hrstart)
    
        console.info('Execution time: %dms', end)
        console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    }, simulateTime)
}

//NP campings
async function getCampings(listParks) {
    try{
        const promises = listParks.map(async (park) => {
            const { data } = await axios.get(park.link);
            const $ = cheerio.load(data);    
            $(".scrollingBox__item.camping h3 a").get().map(camping => {
                park.campings.push({
                    name: $(camping).text().trim(),
                    link: `${park.link.split("/")[2]}${$(camping).attr('href')}`
                })
                console.log(`getCampings:: New camping created (${park.campings.slice(-1)[0].name})`);
            });
            return listParks;
        })
        await Promise.all(promises);
        await insertMany(listParks);
        console.log(`getCampings:: done`);
    } catch (err) {
        console.error(err);
    }
};

//National Parks
async function getNationalParks() {
    try{
        const { data } = await axios.get(process.env.PARKS);
        const $ = cheerio.load(data);    
        const listParks = $(".dynamicListing li a").get().map(park => {
            return {
                parkName: $(park).text().trim(),
                link: $(park).attr('href'),
                campings: []
            }
        });
        console.log(`getNationalParks:: ${listParks.length} Parks collected`);
        return listParks;
    } catch (err) {
        console.error(err);
    }
};

async function insertMany(documents){
    //MongoDB
    const uri = process.env.URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    const mycoll = "parks";

    client.connect( async function(err, db) {
        if (err) throw err;

        try{
            await client.db().dropCollection(mycoll);
            console.log(`insertMany:: Collection ${mycoll} deleted`);
        } catch(err) {
            if (err.codeName == 'NamespaceNotFound') {
                console.log(`insertMany:: Collection ${mycoll} already deleted`)
            }
        } finally{
            let result = await client.db().collection(mycoll).insertMany(documents);
            console.log(`insertMany:: ${result.insertedCount} documents created`);
            client.close();
        }
    });
}

async function main(){
    await getCampings(await getNationalParks());
    getExecutionTime();
}

main();