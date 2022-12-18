let bip39 = require('bip39');
let ethereumjs_wallet = require('ethereumjs-wallet');
let {hdkey} = ethereumjs_wallet;
let Ethership = artifacts.require("Ethership");


async function generateWallets(mnemonics, n, hdPathIndex = 0) {
  const hdwallet = hdkey.fromMasterSeed(await bip39.mnemonicToSeed(mnemonics))
  const result = []
  for (let i = 0; i < n; i++) {
    const node = hdwallet.derivePath(`m/44'/60'/0'/0/${i + hdPathIndex}`)
    result.push(node.getWallet())
  }
  return result;
}

module.exports = async function(done) {
    console.log("Deploying seed data to Ethership...");

    const shipperWallets = await generateWallets("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat", 3);

    const shipperNames = {
        0: "DHL",
        1: "POST",
        2: "FEDEX"
    }

    console.log("\nShippers Wallets:");
    for (let i = 0; i < shipperWallets.length; i++) {
        console.log(`Shipper #[${i}] Pub Address: ` + shipperWallets[i].getAddressString() + " (" + shipperNames[i] + ")");
        console.log(`Shipper #[${i}] Private Key: ` + shipperWallets[i].getPrivateKeyString());
    }

    const instance = await Ethership.deployed();

    // Register Shippers
    console.log("\nInitial createShipper calls:");
    const create_shipper_tx_1 = await instance.createShipper(shipperNames[0], shipperWallets[0].getAddressString());
    console.log("createShipper Transaction(1):", create_shipper_tx_1.tx);

    const create_shipper_tx_2 = await instance.createShipper(shipperNames[1], shipperWallets[1].getAddressString());
    console.log("createShipper Transaction(2):", create_shipper_tx_2.tx);

    const create_shipper_tx_3 = await instance.createShipper(shipperNames[2], shipperWallets[2].getAddressString());
    console.log("createShipper Transaction(3):", create_shipper_tx_3.tx);


    // Create Shipments Transactions
    console.log("\nInitial createShipment calls:");
    const create_shipment_tx_1 = await instance.createShipment(100, "5 barrels of oil");
    console.log("createShipment Transaction(1):", create_shipment_tx_1.tx);

    const create_shipment_tx_2 = await instance.createShipment(400, "22 barrels of oil");
    console.log("createShipment Transaction(2):", create_shipment_tx_2.tx);

    const create_shipment_tx_3 = await instance.createShipment(800, "48 barrels of oil");
    console.log("createShipment Transaction(3):", create_shipment_tx_3.tx);



    // Move and replace file from ./build/contracts/Ethership.json to ./src/contracts/Ethership.json
    require('fs').copyFileSync('./build/contracts/Ethership.json', './src/contracts/Ethership.json');

    done();
};