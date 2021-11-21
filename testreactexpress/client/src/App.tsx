import './styles/App.css';
import AppHeader from './components/AppHeader';
import AppBody from "./components/AppBody";
import AppFooter from "./components/AppFooter";
import MetamaskMissing from "./components/MetamaskMissing";
import React, {useState} from "react";
import AdminDashboard from "./components/AdminDashboard";

function App() {
    const [adminDashboard, setAdminDashboard] = React.useState(false);
    const [adminButtonText, setAdminButtonText] = React.useState('Admin panel');

    const displayOrHideAdminPanel = () => {
        adminDashboard ? setAdminDashboard(false) : setAdminDashboard(true);
        adminDashboard ? setAdminButtonText('Admin panel') : setAdminButtonText('Markets');
    }

  return (
      <>
          <div className="App">
              <AppHeader displayOrHideAdminPanel={displayOrHideAdminPanel} adminButtonText={adminButtonText} />
              {
                  adminDashboard ? <AdminDashboard /> :
                  typeof window.ethereum !== 'undefined' ?
                      <AppBody /> : <MetamaskMissing />
              }
              <AppFooter />
          </div>
      </>
  );
}

export default App;
