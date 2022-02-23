import React from 'react';
// @ts-ignore
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import { MoralisProvider } from 'react-moralis';

const moralisAppId = "TOztSARbRiept5yBSz2eaDFzPB8lrq8WyoZ50tEu";
const moralisServerURL = "https://eebpwn31lfth.usemoralis.com:2053/server";

ReactDOM.render(
    <React.StrictMode>
        <MoralisProvider appId={moralisAppId} serverUrl={moralisServerURL}>
            <App/>
        </MoralisProvider>
    </React.StrictMode>,
    document.getElementById('root')
);