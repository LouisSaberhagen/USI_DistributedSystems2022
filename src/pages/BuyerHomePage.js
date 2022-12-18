import React from 'react';
import { Link } from "react-router-dom";
import detectEthereumProvider from '@metamask/detect-provider';

const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");

export default function HomePage() {
  
  const [shipments, setShipments] = React.useState([]);

  React.useEffect(()=> {
    // On page init, load contract
    loadShipments();
  }, []);


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
        price: shipment.price.toNumber()
      }
      if (shipment.status.toNumber() === 0){
        _shipments.push(_shipment);
      }
    }
    setShipments(_shipments);
  }

  return (
    <div className="App">
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
                <td>{shipment.price}</td>
              </tr>
            );
          })
        }
        </tbody>
    </table>
    </div>
  );
}
