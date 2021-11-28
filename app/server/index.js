const express = require("express")
const {MongoClient} = require("mongodb")

const PORT = process.env.PORT || 3001

const app = express()

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




app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
});