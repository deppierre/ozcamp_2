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
    
        console.info('Execution time: %dms', end)
        console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
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

//National Parks
async function getNationalParks() {
    try{
        const body1 = await getHtmlBody(process.env.PARKS)
        for (const element of body1(".dynamicListing li a")) {
            url1 = body1(element).attr('href')
            const body2 = await getHtmlBody(url1)
            for (const element2 of body2(".scrollingBox__item.camping h3 a")){
                console.log(body2(element2).text().trim())
                console.log(`${url1.split("/")[2]}${body2(element2).attr('href')}`)
            }
        }
    } catch(err) {
        console.error(`ERROR: ${err}`)
    }
};

async function main(){
    await getNationalParks();
    getExecutionTime();
}

main();