const express = require("express")
const bodyParser = require("body-parser");
const {MongoClient} = require("mongodb")

const PORT = process.env.PORT || 3001

const app = express()

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const loadMarkets = async () => {
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri)
    let data;

    try{
        await client.connect()
        await client.db("PredictionMarkets").collection("MarketList").find().toArray().then(markets => {
            data = markets
        })
    }catch (e){
        console.error(e)
    }finally {
        await client.close()
    }

    return data
}

const getAdmins = async () => {
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri)
    let data;

    try{
        await client.connect()
        await client.db("PredictionMarkets").collection("AdminList").find().toArray().then(admins => {
            data = admins
        })
    }catch (e){
        console.error(e)
    }finally {
        await client.close()
    }

    return data
}

const insertNewMarketIntoDatabase = async (req) => {
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri)
    try{
        await client.connect()
        if(
            typeof req.body.marketName !== 'undefined' &&
            typeof req.body.marketDescription !== 'undefined' &&
            typeof req.body.validUntil !== 'undefined' &&
            typeof req.body.createdTimestamp !== 'undefined' &&
            typeof req.body.contractAddress !== 'undefined' &&
            typeof req.body.providerFee !== 'undefined' &&
            typeof req.body.inferiorShare !== 'undefined' &&
            typeof req.body.ratio !== 'undefined' &&
            typeof req.body.liquidity !== 'undefined' &&
            typeof req.body.marketVolume !== 'undefined'
        ){
            await client.db("PredictionMarkets").collection("MarketList").insertOne({
                marketName: req.body.marketName,
                marketDescription: req.body.marketDescription,
                validUntil: req.body.validUntil,
                createdTimestamp: req.body.createdTimestamp,
                contractAddress: req.body.contractAddress,
                providerFee: req.body.providerFee,
                inferiorShare: req.body.inferiorShare,
                ratio: req.body.ratio ,
                liquidity: req.body.liquidity,
                marketVolume: req.body.marketVolume
            })
        }
    }catch (e){
        console.error(e)
    }finally {
        await client.close()
    }
}

app.get("/markets_api", async (req, res) => {
    loadMarkets().then(r => {
        res.json({
            marketList: r,
        })
    })
});

app.get("/admins_api", async (req, res) => {
    getAdmins().then(r => {
        res.json({
            adminList: r,
        })
    })
});

app.post("/insert_market", jsonParser, async (req, res) => {
    console.log(req.body)
    insertNewMarketIntoDatabase(req).then(r => {
        res.json({
            message: r,
        })
    })
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
});