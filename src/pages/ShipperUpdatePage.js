import React from 'react';
import {
  useParams
} from "react-router-dom";
import detectEthereumProvider from '@metamask/detect-provider';
import parse from 'html-react-parser'
import web3 from 'web3';

const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");

export default function ShipperUpdatePage(props) {
  let { id } = useParams();

  const [productTitle, setProducTitle] = React.useState("");
  const [productPrice, setProductPrice] = React.useState("");
  const [productStatus, setProductstatus] = React.useState(0);
  const [productIncoterm, setProductIncoterm] = React.useState(0);
  const [shipperAddress, setShipperaAddress] = React.useState("");
  const [shipperName, setShipperName] = React.useState("");

  React.useEffect(()=> {
    loadShipment(id);
  }, [id]);

  const loadShipment = async (id) => {
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    const shipment = await ethershipInstance.shipments(id);
    const _shipperName = await ethershipInstance.allowedShippersName(shipment.shipper);

    setProducTitle(shipment.title);
    setProductPrice(web3.utils.fromWei(shipment.price, 'ether'));
    setProductstatus(shipment.status.toNumber());
    setProductIncoterm(shipment.contracted_incoterm.toNumber());
    setShipperaAddress(shipment.shipper);
    setShipperName(_shipperName);
    console.log({shipment});
  }
  
  const handleUpdate = async () => {
    //alert('Update button clicked!');
    if (!props.account) return alert("Please connect your wallet first.");

    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value;


    console.log({status});

    try {
      await ethershipInstance.updateShipment(id, status, notes, {from: props.account});
    }catch (e){
      return alert("Error updating shipment");
      console.warn({e});
    }

    alert("Shipment updated successfully!");
  }

  const statusEnum = {
    0: "On Sale",
    1: "Ordered <b>(goods at origin)</b>",
    2: "Failed before transit <b>(goods at origin)</b>",
    3: "In Transit <b>(goods at transport)</b>",
    4: "Failed before delivery <b>(goods at transport)</b>",
    5: "Delivered <b>(goods at destination)</b>"
  };

  const incotermEnum = {
    0: "Not set",
    1: "EXW <b>(Buyer ownership at origin)</b>",
    2: "FCA <b>(Buyer ownership at transport)</b>",
    3: "CPT <b>(Buyer ownership at destination)</b>",
  }

  return (
    <div>
      <h1>Shipment #{id}</h1>
      <div>
      <span>Title: {productTitle}</span>
      </div> <br></br>
      <div>
      <div>
      <span>Price: {productPrice} ether</span>
      </div> <br></br>
      <div>
      <span>Status: {parse(statusEnum[productStatus])}</span>
      </div> <br></br>
      <div className="form-row">
        <label htmlFor="Status">Choose the status:</label>
        <select name="status" id="status">
          <option value="2">Failed before transit</option>
          <option value="3">In transit</option>
          <option value="4">Failed before delivery</option>
          <option value="5">Delivered</option>
        </select> 
      </div><br/>
      
      <div>
        <label htmlFor="notes">Notes:</label>
        <input type="text" id="notes" name="notes" />
      </div><br />

      <div>
      <span>Incoterm: {parse(incotermEnum[productIncoterm])}</span>
      </div> <br></br>

      <div>
      <span>Shipper: {shipperAddress} <b>({shipperName})</b></span>
      </div> <br></br>
      </div>

      <div>
      <button onClick={handleUpdate}>Update</button>
      </div><br></br>

    </div>
  )
};