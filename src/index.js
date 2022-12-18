import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';

// react-router-dom
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

// routes
import BuyerHomePage from './pages/BuyerHomePage';
import SellerHomePage from './pages/SellerHomePage';
import ShipmentBuyPage from './pages/ShipmentBuyPage';


function AppRoutes() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [currentRole, setCurrentRole] = React.useState("buyer");

  const handleConnectButton = () => {
    // request web3 metamask access
    if (!window.ethereum) return alert("Please install MetaMask.");

    window.ethereum.request({ method: 'eth_requestAccounts' })
      .then((accounts) => {
        // what to do with this accounts
        setCurrentAccount(accounts[0]);
      }
    );
  }

  const switchRole = (role, e) => {
    e.preventDefault();
    setCurrentRole(role);
  }

  return (
    <Router>
      <div className="app">
        <div className="header">
          <div className="actions">
          <h1>Ethership</h1>
          <button onClick={handleConnectButton}>Connect</button>
          <span>{currentAccount}</span>
          </div>
          <div className="roles">
            <div className={ currentRole == 'buyer' ? 'active' : ''}>
              <a onClick={(eventHandler)=> switchRole('buyer', eventHandler)} href="/">Buyer</a>
            </div>
            <div className={ currentRole == 'seller' ? 'active' : ''}>
              <a onClick={(eventHandler)=> switchRole('seller', eventHandler)} href="/">Seller</a>
            </div>
            <div className={ currentRole == 'shipper' ? 'active' : ''}>
              <a onClick={(eventHandler)=> switchRole('shipper', eventHandler)} href="/">Shipper</a>
            </div>
          </div>
        </div>

        <Switch>
          {
            currentRole === "buyer" && (
              <Route exact path="/">
                <BuyerHomePage />
              </Route>
            )
          }
          {
            currentRole === "seller" && (
              <Route exact path="/">
                <SellerHomePage />
              </Route>
            )
          }
          <Route path="/shipment/buy/:id">
            <ShipmentBuyPage account={currentAccount} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);