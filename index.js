const cheerio = require("cheerio")
// const Parks = require("./parksSchema")
const axios = require("axios")
const env = require('dotenv').config()
const mongoose = require("mongoose")
const Parks = require("./parksSchema")
const { MongoClient, ServerApiVersion } = require('mongodb');
const { data } = require("cheerio/lib/api/attributes");

function getHtmlBody(url){
    if(url){
        return axios.get(url).then((request) => {
            return cheerio.load(request.data)
        }).catch(err => console.error(err))
    }else{
        throw `URL is missing(${url})`
    }
};

async function getNationalParks(){
    const allelements = []
    await getHtmlBody(process.env.PARKS).then((body) => {
        body(".dynamicListing li a").map((v, k) => {
            allelements.push({ 
                "name": body(k).text().trim(), 
                "url": body(k).attr('href') 
            })
        })
    })

    await Promise.all(allelements.map(async (v, k) => {
        return getHtmlBody(v.url).then((body2) => {
            const newBody2 = body2(".scrollingBox__item.camping h3 a")
            if(newBody2.length > 0){
                allelements[k]["campings"] = []
                for (const element2 of newBody2){
                    allelements[k]["campings"].push({
                        name: body2(element2).text().trim(),
                        url: v.url.split("/")[2] + body2(element2).attr('href').trim()
                    })
                }
            }
        })
    }))

    return allelements
};

async function main () {
    try{
        console.time("Execution time")

        //Mongoose
        mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
            console.log("INFO: Mongoose connected")
        }).catch((e) => 
            console.error(e))
        
        const parks = await getNationalParks()
        console.log(`INFO: ${Object.keys(parks).length} parks fetched`)

        await Parks.deleteMany()
        const data = await Parks.create(parks)
        console.log(`INFO: ${data.length} parks inserted`)
    }
    catch(err) {
        console.error(`ERROR: ${err}`)
    }
    finally{
        console.timeEnd("Execution time")
        mongoose.connection.close()
    }
};

main()