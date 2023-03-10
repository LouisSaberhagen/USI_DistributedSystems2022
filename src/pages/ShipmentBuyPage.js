import React from 'react';
import {
  useParams,
  Redirect
} from "react-router-dom";
import detectEthereumProvider from '@metamask/detect-provider';
import web3 from 'web3';
import {useHistory} from 'react-router-dom';

const ethershipArtifact = require("../contracts/Ethership.json"); 
const contract = require("@truffle/contract");


export default function ShipmentBuyPage(props) {
  let { id } = useParams();
  let history = useHistory();

  const [productTitle, setProducTitle] = React.useState("");
  const [productPrice, setProductPrice] = React.useState("");
  const [shipperAddresses, setShipperaAddresses] = React.useState([]);
  const [shipperNames, setShipperNames] = React.useState([]);

  React.useEffect(()=> {
    loadShippers();
  }, []);

  React.useEffect(()=> {
    console.log({props});
  }, [props]);

  React.useEffect(()=> {
    loadShipment(id);
  }, [id]);

  React.useEffect(()=> {
    loadShippersNames(shipperAddresses);
  }, [shipperAddresses]);

  React.useEffect(()=> {
    console.log({shipperNames});
  }, [shipperNames]);

  const loadShippersNames = async (addresses) => {
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    const _names = await Promise.all(addresses.map(async (address) => {
      return await ethershipInstance.allowedShippersName(address);
    }));

    setShipperNames(_names);
  }

  const loadShippers = async () => {
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    const _shippers = await ethershipInstance.getAllowedShippers();
    setShipperaAddresses(_shippers);
  }

  const loadShipment = async (id) => {
    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    const shipment = await ethershipInstance.shipments(id);

    setProducTitle(shipment.title);
    setProductPrice(web3.utils.fromWei(shipment.price, 'ether'));
  }

  const handleBuyButon = async () => {
    if (!props.account) return alert("Please connect your wallet first.");

    const ethershipContract = contract(ethershipArtifact);
    const provider = await detectEthereumProvider()
    ethershipContract.setProvider(provider);
    const ethershipInstance = await ethershipContract.deployed();

    const incoterm = document.getElementById("incoterms").value;
    const shipper = document.getElementById("shipper").value;

    const _shipment = await ethershipInstance.shipments(id);

    console.log({incoterm, shipper});

    try {
      await ethershipInstance.buyShipment(id, incoterm, shipper, {from: props.account, value: _shipment.price});
    }catch (e){
      alert("Error buying shipment");
      console.warn({e});
    }

    history.push(`/shipment/status/${id}`); 
  }


  return (
    <div>
      <h1>Buy Shipment #{id}</h1>

      <div className="form-row">
        <span>Product Title: {productTitle}</span>
      </div>

      <div className="form-row">
        <span>Price: {productPrice} ether</span>
      </div>

      <div className="form-row">
        <label htmlFor="incoterms">Choose an incoterm:</label>
        <select name="incoterms" id="incoterms">
          <option value="1">EXW</option>
          <option value="2">FCA</option>
          <option value="3">CPT</option>
        </select> 
      </div>

      <div className="form-row">
        <label htmlFor="shippers">Choose a shipper:</label>
        <select name="shipper" id="shipper">
          {
            shipperNames.map((name, index) => {
              return <option key={index} value={shipperAddresses[index]}>{name}</option>
            })
          }
        </select> 
      </div>

      <div className="form-row">
        <button onClick={handleBuyButon} type="button">Buy it!</button> 
      </div>
    </div>
  );
}