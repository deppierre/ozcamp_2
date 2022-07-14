const { MongoClient, ServerApiVersion } = require('mongodb');
const env = require('dotenv').config()

const client = new MongoClient(process.env.URI);
const database = client.db(process.env.DATABASE)

function openColl(myCollection){
    const myColl = database.collection(myCollection)
    console.log(`INFO: Namespace connected (${myColl.namespace})`)

    return myColl
}

function closeDb(){
    console.log(`INFO: Database closed (${database.namespace})`)
    
    return client.close()
}

module.exports = { openColl, closeDb }