import React from 'react';
import {
  useParams
} from "react-router-dom";
import detectEthereumProvider from '@metamask/detect-provider';
import parse from 'html-react-parser'
import web3 from 'web3';

const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");

export default function ShipmentStatusPage(props) {
  let { id } = useParams();

  const [productTitle, setProducTitle] = React.useState("");
  const [productPrice, setProductPrice] = React.useState('');
  const [productStatus, setProductstatus] = React.useState(0);
  const [productIncoterm, setProductIncoterm] = React.useState(0);
  const [productBuyer, setProductBuyer] = React.useState("");
  const [productSeller, setProductSeller] = React.useState("");
  const [shipperAddress, setShipperaAddress] = React.useState("");
  const [shipperName, setShipperName] = React.useState("");
  const [shipperNotes, setShipperNotes] = React.useState("");
  const [isShipmentRefunded, setIsShipmentRefunded] = React.useState(false);

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
    setProductSeller(shipment.seller);
    setProductBuyer(shipment.buyer);
    setShipperNotes(shipment.shipper_notes);
    setIsShipmentRefunded(shipment.refunded);
    setShipperName(_shipperName);
    console.log({shipment});
  }
  
  const handleRefundButton = async () => {
    if (!props.account) return alert("Please connect your wallet first.");

    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    if (props.account.toLowerCase() !== productBuyer.toLowerCase()) return alert("You are not the buyer of this shipment.");

    var canWithdraw = false;
    let incoterm = productIncoterm;
    let status = productStatus;

    try {
      canWithdraw = await ethershipInstance.canBuyerWithdrawFunds(incoterm, status, {from: props.account});
    } catch (e) {
      console.log(e);
      canWithdraw = false;
    }

    if (!canWithdraw) return alert("You can't request a refund based on the agreed incoterms.");

    var tx;
    try {
      tx = await ethershipInstance.buyerWithdraw(id, {from: props.account});
    } catch (e) {
      console.log(e);
      return alert('Withdraw failed');
    }
    
    console.log({tx});
    alert('Withdraw successful');
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

      <div>
      <span>Incoterm: {parse(incotermEnum[productIncoterm])}</span>
      </div> <br></br>

      <div>
      <span>Buyer: {productBuyer}</span>
      </div> <br></br>

      <div>
      <span>Seller: {productSeller}</span>
      </div> <br></br>


      <div>
      <span>Shipper: {shipperAddress} <b>({shipperName})</b></span>
      </div> <br></br>
      </div>

      <div>
      <span>Shipper Notes: <i>{shipperNotes}</i></span>
      </div> <br></br>


      <div>
      <span>Refunded: <b>{JSON.stringify(isShipmentRefunded)}</b></span>
      </div> <br></br>



      <div>
      <button onClick={handleRefundButton}>Refund me!</button>
      </div><br></br>

    </div>
  )
};