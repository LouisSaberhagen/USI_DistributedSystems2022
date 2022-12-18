import React from "react";
import web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider';
import {useHistory} from 'react-router-dom';

const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");

export default function SellerCreateShipmentPage(props){
  let history = useHistory();

  const handleCreateButton = async () => {
    if (!props.account) return alert("Please connect your wallet first.");

    // js code for getting the values from the inputs with id good and price.

    const productPriceInETH = document.getElementById("price").value;
    const productTittle = document.getElementById("title").value;

    // convert productPriceInETH to wei using web3.utils.toWei
    const productPriceInWei = web3.utils.toWei(productPriceInETH, 'ether');

    // call createShipment function from the contract
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    try {
      const tx = await ethershipInstance.createShipment(productPriceInWei, productTittle, {from: props.account});
    } catch (error) {
      console.log(error);
      return alert ("Coudln't create new shipment");
    }

    alert("Shipment created successfully");
    history.goBack();
  }

  return (
    <div>
      <h1>Create new shipment for sale</h1>

      <div>
        <label htmlFor="good">Product Title: &nbsp;</label>
        <input type="text" id="title" name="title" />
      </div><br />
      <div>
        <label htmlFor="price">Product Price (in ETH): &nbsp;</label>
        <input type="text" id="price" name="price" />
      </div><br />

      <div className="form-row">
        <button onClick={handleCreateButton} type="button">Create</button> 
      </div><br />
    </div>
  );
}