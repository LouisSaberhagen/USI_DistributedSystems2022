import React from 'react';
import { Link } from "react-router-dom";
import detectEthereumProvider from '@metamask/detect-provider';
import web3 from 'web3';

const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");

export default function HomePage(props) {
  
  const [shipments, setShipments] = React.useState([]);
  const [myShipments, setMyShipments] = React.useState([]);

  React.useEffect(()=> {
    // On page init, load contract
    loadShipments();
  }, []);

  React.useEffect(()=>{
    if (!props.account) return;

    loadMyShipments();
  }, [props.account]);


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
        price: web3.utils.fromWei(shipment.price, 'ether'),
      }
      if (shipment.status.toNumber() === 0){
        _shipments.push(_shipment);
      }
    }
    setShipments(_shipments);
  }

  const loadMyShipments = async () => {
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
        price: web3.utils.fromWei(shipment.price, 'ether'),
      }
      if (shipment.buyer.toLowerCase() === props.account){
        _shipments.push(_shipment);
      }
    }
    setMyShipments(_shipments);
  }

  return (
    <div className="App">
      <h2>Shipments for Sale</h2>
      {
        shipments.length === 0
        ? (<p>No shipments for sale.</p>)
        : (
          <table>
            <thead>
            <tr>
                <th>Shipment</th>
                <th>Seller Address</th>
                <th>Price</th>
            </tr>
            </thead>
            <tbody>
            {
              shipments.map((shipment) => {
                return (
                  <tr key={shipment.id}>
                    <td><Link to={`/shipment/buy/${shipment.id}`}>{shipment.title}</Link></td>
                    <td>{shipment.seller}</td>
                    <td>{shipment.price} ether</td>
                  </tr>
                );
              })
            }
            </tbody>
          </table>
        )
      }
      <h2>Your shipments</h2>
      {
        props.account 
        ? 
          (
            <>
            {
              myShipments.length === 0
              ? (<p>No shipments have been bought.</p>)
              : (
                <table>
                <thead>
                <tr>
                    <th>Shipment</th>
                    <th>Seller Address</th>
                    <th>Price</th>
                </tr>
                </thead>
                <tbody>
                {
                  myShipments.map((shipment) => {
                    return (
                      <tr key={shipment.id}>
                        <td><Link to={`/shipment/status/${shipment.id}`}>{shipment.title}</Link></td>
                        <td>{shipment.seller}</td>
                        <td>{shipment.price} ether</td>
                      </tr>
                    );
                  })
                }
                </tbody>
              </table>
              )
            }
            </>
          )
        : (
          <span>Please connect to see your shipments</span>
        )
      }
    </div>
  );
}
