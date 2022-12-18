import React from 'react';
import { Link } from "react-router-dom";
import detectEthereumProvider from '@metamask/detect-provider';
import parse from 'html-react-parser'
import truncateEthAddress from 'truncate-eth-address'
import web3 from 'web3';

// balance
// withdraw button
// table of my products for sale
// add new product button
const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");

export default function SellerHomePage(props) {
  const [metamaskIsConnected, setMetamaskIsConnected] = React.useState(false);
  const [shipments, setShipments] = React.useState([]);
  const [sellerBalance, setSellerBalance] = React.useState("");
  //Use react use effect on props.currentAccount to set metamaskIsConnected
  React.useEffect(() => {
    if (props.account) {
      setMetamaskIsConnected(true);
    }else{
      setMetamaskIsConnected(false);
    }
  }, [props.account]);
  
  React.useEffect(() => {
    if (!metamaskIsConnected) return;

    loadShipments();
    loadSellerBalance();
  }, [metamaskIsConnected]);

  const loadSellerBalance = async () => {
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();
    const balance = await ethershipInstance.sellersBalance(props.account);
    // convert balance to ETH using web3.utils.fromWei
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    setSellerBalance(balanceInEth);
  }

    const loadShipments = async () => {
      const ethershipContract = contract(ethershipArtifact);
      const provider = await detectEthereumProvider()
      ethershipContract.setProvider(provider);
      const ethershipInstance = await ethershipContract.deployed();
      const numberOfShipments = await ethershipInstance.totalShipments();
      console.log({numberOfShipments: numberOfShipments.toNumber()});
      //js loop
      let _shipments = []
      for (let i = 0; i < numberOfShipments.toNumber(); i++) {
        const shipment = await ethershipInstance.shipments(i);
        const _shipment = {
          id: shipment.id.toNumber(),
          title: shipment.title,
          seller: shipment.seller,
          shipper: shipment.shipper,
          buyer: shipment.buyer,
          status: shipment.status.toNumber(),
        }
    
        if (shipment.seller.toLowerCase() === props.account.toLowerCase()){
          _shipments.push(_shipment);
        }
      }
      setShipments(_shipments);
    }
    const statusEnum = {
      0: "OnSale",
      1: "Ordered",
      2: "FailedBeforeTransit",
      3: "InTransit",
      4: "FailedBeforeDelivery",
      5: "Delivered"
    };

    if (!metamaskIsConnected) {
      return (
        <div>
        <h1>Seller Home Page</h1>
        <h2>Connect to metamask first</h2>
        </div>
      );
    }

    return (
    <div>
      <h1>Seller Home Page</h1>
      <h2>Balance: {sellerBalance} ETH</h2><br/>
      <button>Withdraw</button><br/>
      <h2>My Products For Sale</h2>
      {
        shipments.length > 0
        ? (
          <table>
          <thead>
          <tr>
              <th>Shipment</th>
              <th>Status</th>
              <th>Seller Address</th>
              <th>Buyer Address</th>
          </tr>
          </thead>
          <tbody>
          {
            shipments.map((shipment) => {
              return (
                <tr key={shipment.id}>
                  <td><span>{shipment.title}</span></td>
                  <td><span>{statusEnum[shipment.status]}</span></td>
                  <td><span title={shipment.seller}>{parse(truncateEthAddress(shipment.seller, 15))}</span></td>
                  <td><span title={shipment.buyer}>{parse(truncateEthAddress(shipment.buyer, 15))}</span></td>
                </tr>
              );
            })
          }
          </tbody>
        </table>
        ) :
        (
          <div>You don't have any products for sale</div>
        )
      }
      <br/>
      <Link to="/seller/create_shipment"><button>Add New Product</button></Link>
    </div>
  )
}