const cheerio = require("cheerio")
const mongoose = require("mongoose")
const axios = require("axios")
const env = require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const { data } = require("cheerio/lib/api/attributes");

async function insertMany(documents, mycoll=""){
    try {
        await client.db().dropCollection(mycoll);
        console.log(`INFO: Collection ${mycoll} deleted`);
    } catch(err) {
        if (err.codeName == 'NamespaceNotFound') {
            console.log(`WARNING: Collection ${mycoll} already deleted`)
        }
    } finally {
        const result = await client.db().collection(mycoll).insertMany(documents);
        return result
    }
}

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
    const 
        allpromises = []
        allelements = []
    const body1 = await getHtmlBody(process.env.PARKS)

    for (const element of body1(".dynamicListing li a")) {
        const site = {
            "name": body1(element).text().trim(),
            "url": body1(element).attr('href')
        }
        allelements.push(site)
    }

    await Promise.all(allelements.map(async (value, key) => {
        return getHtmlBody(value.url).then( (body2) => {
            const newBody2 = body2(".scrollingBox__item.camping h3 a")
            if(newBody2.length > 0){
                allelements[key]["campings"] = {}
                for (const element2 of newBody2){
                    allelements[key]["campings"][body2(element2).text().trim()] = value.url.split("/")[2] + body2(element2).attr('href').trim()
                }
            }
        })
    }))
    return allelements
};

async function main () {
    try{
        console.time("Execution time");
        //MongoDB
        await client.connect();

        const parks = await getNationalParks();
        console.log(`INFO: ${Object.keys(parks).length} parks fetched`)
        const insertParks = await insertMany(parks, mycoll="parks");
        console.log(`INFO: ${insertParks.insertedCount} documents created`);
    }
    catch(err) {
        console.error(`ERROR: ${err}`)
    }
    finally{
        await client.close();
        console.timeEnd("Execution time");
    }
}

const client = new MongoClient(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

main();