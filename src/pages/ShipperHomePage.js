import React from 'react';
import { Link } from "react-router-dom";
import detectEthereumProvider from '@metamask/detect-provider';
import parse from 'html-react-parser'
import truncateEthAddress from 'truncate-eth-address'
import web3 from 'web3';

const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");

export default function ShipperHomePage(props) {

  const [metamaskIsConnected, setMetamaskIsConnected] = React.useState(false);
  const [shipments, setShipments] = React.useState([]);
  const [shipperBalance, setShipperBalance] = React.useState("");


  //Use react use effect on props.currentAccount to set metamaskIsConnected
  React.useEffect(() => {
    if (props.account) {
      setMetamaskIsConnected(true);
    }else{
      setMetamaskIsConnected(false);
    }

    if (props.account){
      loadShipments();
      loadShipperBalance();
    }
  }, [props.account]);

  const loadShipperBalance = async () => {
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();
    const balance = await ethershipInstance.shippersBalance(props.account);
    // convert balance to ETH using web3.utils.fromWei
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    setShipperBalance(balanceInEth);
  }

  const handleShipperWithdraw = async () => {
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();
    await ethershipInstance.shipperWithdraw({from: props.account});
    setShipperBalance(0);
  }


    // TODO: Don't display shipments that are not onSale
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

      if (shipment.shipper.toLowerCase() === props.account.toLowerCase()){
        _shipments.push(_shipment);
      }
    }
    setShipments(_shipments);
  }

  if (!metamaskIsConnected) {
  return (
    <div>
      <h1>Shipments</h1>
      <p>Connect your Metamask wallet to see your shipments.</p>
    </div>
  );
  }

  const statusEnum = {
    0: "OnSale",
    1: "Ordered",
    2: "FailedBeforeTransit",
    3: "InTransit",
    4: "FailedBeforeDelivery",
    5: "Delivered"
  };


  return (
    <div>
      <h1>Shipments</h1>
      <h2>Balance: {shipperBalance} ETH</h2>
      <button onClick={handleShipperWithdraw}>Withdraw</button>
      <br/><br/>
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
                <td><Link to={`/shipper/update/${shipment.id}`}>{shipment.title}</Link></td>
                <td><span>{statusEnum[shipment.status]}</span></td>
                <td><span title={shipment.seller}>{parse(truncateEthAddress(shipment.seller, 15))}</span></td>
                <td><span title={shipment.buyer}>{parse(truncateEthAddress(shipment.buyer, 15))}</span></td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
    </div>
  );
}