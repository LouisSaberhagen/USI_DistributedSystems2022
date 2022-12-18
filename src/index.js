import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';

// react-router-dom
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  Link
} from "react-router-dom";

// routes
import BuyerHomePage from './pages/BuyerHomePage';
import SellerHomePage from './pages/SellerHomePage';
import SellerCreateShipmentPage from './pages/SellerCreateShipmentPage';
import ShipmentBuyPage from './pages/ShipmentBuyPage';
import ShipmentStatusPage from './pages/ShipmentStatusPage';
import ShipperHomePage from './pages/ShipperHomePage';
import ShipperUpdatePage from './pages/ShipperUpdatePage';

function AppRoutes() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [currentRole, setCurrentRole] = React.useState("buyer");
  let location = useLocation();

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

  React.useEffect(() => {
    if (location.pathname.includes('seller')) {
      setCurrentRole('seller');
    } else if (location.pathname.includes('shipper')) {
      setCurrentRole('shipper');
    } else {
      setCurrentRole('buyer');
    }
  }, [location]);

  // TODO: Do this based on router uri change
  const switchRole = (role, e) => {
    e.preventDefault();
    setCurrentRole(role);
  }

  return (
    <>
      <div className="app">
        <div className="header">
          <div className="actions">
          <h1><Link style={{color: 'black'}} to="/">Ethership</Link></h1>
          <button onClick={handleConnectButton}>Connect</button>
          <span>{currentAccount}</span>
          </div>
          <div className="roles">
            <div className={ currentRole == 'buyer' ? 'active' : ''}>
              <Link to="/">Buyer</Link>
            </div>
            <div className={ currentRole == 'seller' ? 'active' : ''}>
              <Link to="/seller">Seller</Link>
            </div>
            <div className={ currentRole == 'shipper' ? 'active' : ''}>
              <Link to="/shipper">Shipper</Link>
            </div>
          </div>
        </div>

        <Switch>
          <Route exact path="/">
            <BuyerHomePage account={currentAccount} />
          </Route>
          <Route exact path="/seller">
            <SellerHomePage account={currentAccount} />
          </Route>
          <Route exact path="/seller/create_shipment">
            <SellerCreateShipmentPage account={currentAccount} />
          </Route>
          <Route exact path="/shipper">
            <ShipperHomePage account={currentAccount} />
          </Route>
          <Route exact path="/shipper/update/:id">
            <ShipperUpdatePage account={currentAccount} />
          </Route>
          <Route path="/shipment/buy/:id">
            <ShipmentBuyPage account={currentAccount} />
          </Route>
          <Route path="/shipment/status/:id">
            <ShipmentStatusPage account={currentAccount} />
          </Route>
        </Switch>
      </div>
      </>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AppRoutes />
    </Router>
  </React.StrictMode>
);