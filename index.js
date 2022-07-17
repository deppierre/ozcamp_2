const cheerio = require("cheerio")
const axios = require("axios")
const env = require('dotenv').config()
const { data } = require("cheerio/lib/api/attributes");
const myDb = require('./dbConnect.js')

async function getHtmlBody(url){
    if(url){
        const request = await axios.get(url, { withCredentials: true })
        return cheerio.load(request.data)
    }
    else{
        throw `URL is missing(${url})`
    }
};

async function runRefreshCampingUrl(){
    const myCollection = myDb.openColl("nationalparks")

    //Update national parks
    const body = await getHtmlBody(process.env.PARKS)
    for (const element of body(".dynamicListing li a")){
        await myCollection.updateOne({
            "name": body(element).text().trim()
        },{ $set:{
            "name": body(element).text().trim(), 
            "url": body(element).attr('href')
        }}, { upsert: true })
    }

    const allParks = await myCollection.find().toArray()

    //Update campings list
    const fetchUrl = async (park) => {
        const body2 = await getHtmlBody(park.url);
        const newBody2 = body2(".scrollingBox__item.camping h3 a")
        if(newBody2.length > 0){
            for (const element2 of newBody2){
                await myCollection.updateOne({
                    "name": park.name
                },{ $addToSet:{
                    "campings": {
                        "name": body2(element2).text().trim(),
                        "url": "https://" + park.url.split("/")[2] + body2(element2).attr('href').trim() 
                    }
                }})
            }
        }
    }

    const promises = allParks.map(fetchUrl);
    await Promise.all(promises);

    //Update campings metadata

    return allParks
};

async function main (refreshCampingUrl=true, refreshCampingData=true) {

    try{
        console.time("Execution time")
        
        if(refreshCampingUrl){
            const parks = await runRefreshCampingUrl()
            console.log(`INFO: ${Object.keys(parks).length} parks fetched`)
        }
        if(refreshCampingData){
            await Parks.find({"campings.0":{"$exists":true}}).then( (data) => {
                data.forEach( (v1, k1) => {
                    v1.campings.forEach( (v2,k2) => {
                        console.log(v1["campings"][k2].name)
                    })
                })
            })
        }
    }
    catch(err) {
        console.error(`ERROR: ${err}`)
    }
    finally{
        myDb.closeDb()
        console.timeEnd("Execution time")
    }
};

main(refreshCampingUrl=true,refreshCampingData=false)