import './styles/App.css';
import AppHeader from './components/AppHeader';
import AppBody from "./components/AppBody";
import AppFooter from "./components/AppFooter";
import MetamaskMissing from "./components/MetamaskMissing";
import React from "react";
import Market from "./components/Market";

function App() {

  return (
      <>
          <div className="App">
              <AppHeader />
              {
                  typeof window.ethereum !== 'undefined' ?
                      <AppBody /> : <MetamaskMissing />
              }
              <AppFooter />
          </div>
      </>
  );
}

export default App;
