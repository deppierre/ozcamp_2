const cheerio = require("cheerio")
const axios = require("axios")
const env = require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const { data } = require("cheerio/lib/api/attributes");

const start = new Date()
const hrstart = process.hrtime()
const simulateTime = 5

function getExecutionTime(){
    setTimeout(function (argument) {
        // execution time simulated with setTimeout function
        const end = new Date() - start,
        hrend = process.hrtime(hrstart)
    
        console.info('INFO: Execution time: %dms', end)
    }, simulateTime)
}

// async function insertMany(documents){
//     //MongoDB
//     const uri = process.env.URI;
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//     const mycoll = "parks";

//     client.connect( async function(err, db) {
//         if (err) throw err;

//         try {
//             await client.db().dropCollection(mycoll);
//             console.log(`insertMany:: Collection ${mycoll} deleted`);
//         } catch(err) {
//             if (err.codeName == 'NamespaceNotFound') {
//                 console.log(`insertMany:: Collection ${mycoll} already deleted`)
//             }
//         } finally {
//             const result = await client.db().collection(mycoll).insertMany(documents);
//             console.log(`insertMany:: ${result.insertedCount} documents created`);
//             client.close();
//         }
//     });
// }

function getHtmlBody(url){
    if(url){
        return axios.get(url).then((request) => {
            return cheerio.load(request.data)
        }).catch(err => console.error(err))
    }else{
        throw `URL is missing(${url})`
    }
}

async function getNationalParks() {
    try{
        const allelements = {}
        const body1 = await getHtmlBody(process.env.PARKS)

        for (const element of body1(".dynamicListing li a")) {
            allelements[body1(element).text().trim()] = {
                url: body1(element).attr('href')
            }
        }
        await Promise.all(Object.entries(allelements).map(async([key, value]) => {
            const body2 = await getHtmlBody(value.url)
            const newBody2 = body2(".scrollingBox__item.camping h3 a")
            if(newBody2.length > 0){
                allelements[key]["campings"] = {}
                for (const element2 of newBody2){
                    allelements[key]["campings"][body2(element2).text().trim()] = value.url.split("/")[2] + body2(element2).attr('href').trim()
                }
            }
        }))
        console.log(`INFO: ${Object.keys(allelements).length} parks fetched`)
    } catch(err) {
        console.error(`ERROR: ${err}`)
    }
};

async function main () {
    await getNationalParks();
    getExecutionTime();
}

main()