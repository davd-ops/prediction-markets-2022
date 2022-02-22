const express = require("express");
const bodyParser = require("body-parser");
const predictionMarketProps = require('./predictionMarketContractProps');
const {ethers} = require("ethers");
const {MongoClient} = require("mongodb")

const PORT = process.env.PORT || 3001

const app = express()

// create application/json parser
var jsonParser = bodyParser.json()

const predictionMarketABI = predictionMarketProps.ABI;

const loadMarkets = async () => {
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri)
    let data;

    try {
        await client.connect()
        await client.db("PredictionMarkets").collection("MarketList").find().toArray().then(markets => {
            data = markets
        })
    } catch (e) {
        console.error(e)
    } finally {
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
            typeof req.body.marketVolume !== 'undefined'
        ){
            let isAdmin = false;
            let provider = new ethers.providers.JsonRpcProvider()
            console.log(await provider.getSigner().getAddress())
            const adminAddress = await provider.getSigner().getAddress()
            const adminArray = await getAdmins()
            adminArray.forEach(obj => {
                console.log(obj.address)
                obj.address === adminAddress.toLowerCase() ? isAdmin = true : null
            })
            console.log(isAdmin)

            /*
            await client.db("PredictionMarkets").collection("MarketList").insertOne({
                marketName: req.body.marketName,
                marketDescription: req.body.marketDescription,
                validUntil: req.body.validUntil,
                createdTimestamp: req.body.createdTimestamp,
                contractAddress: req.body.contractAddress,
                providerFee: req.body.providerFee,
                marketVolume: req.body.marketVolume,
                isResolved: false
            })

             */

        } else {
            console.error(req.body)
        }
    } catch (e) {
        console.error(e)
    } finally {
        await client.close()
    }
}

const updateOutcome = async (req) => {
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri)
    try {
        await client.connect()
        if (
            typeof req.body.contractAddress !== 'undefined'
        ) {
            const filter = {contractAddress: req.body.contractAddress}
            let provider = new ethers.providers.JsonRpcProvider();
            const marketContract = new ethers.Contract(req.body.contractAddress, predictionMarketABI, provider)

            const updateDoc = {
                $set: {
                    isResolved: true
                },
            }
            typeof await marketContract.winningSide().length !== "undefined" ?
                await client.db("PredictionMarkets").collection("MarketList").updateOne(filter, updateDoc) : console.log('Market is not resolved yet')
        } else {
            console.error("Something went wrong!")
        }
    } catch (e) {
        console.error(e)
    } finally {
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
    insertNewMarketIntoDatabase(req).then(r => {
        res.json({
            message: req.body,
        })
    })
})

app.post("/update_outcome", jsonParser, async (req, res) => {
    updateOutcome(req).then(r => {
        res.json({
            message: req.body,
        })
    })
})

app.listen(PORT, async () => {
    console.log(`Server listening on ${PORT}`)
});