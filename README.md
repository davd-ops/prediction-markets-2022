# PredictionMarkets

## You will need:

Hardhat - https://hardhat.org/getting-started/

Node.js - https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

## How to start with localhost testing

### Local Ethereum development network

#### `cd smartcontracts`
Moves you to the correct directory.

#### `npx hardhat node`
Starts local Ethereum node.

### Deploying usd stablecoin

#### `cd smartcontracts`
Moves you to the correct directory.

#### `npx hardhat run --network localhost scripts/deployUsd.js`
Deploys stablecoin contract to local network.

### Local server setup

#### `cd app`
Moves you to the correct directory.

#### `npm run dev`
Starts local server.

### Local client setup

#### `cd app/client`
Moves you to the correct directory.

#### `npm run start`
Starts local react client.