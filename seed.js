let bip39 = require('bip39');
let ethereumjs_wallet = require('ethereumjs-wallet');
let {hdkey} = ethereumjs_wallet;
let Ethership = artifacts.require("Ethership");
global.web3 = web3;

var truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

var truncateEthAddress = function (address) {
    var match = address.match(truncateRegex);
    if (!match)
        return address;
    return match[1] + "\u2026" + match[2];
};

async function generateWallets(mnemonics, n, hdPathIndex = 0) {
  const hdwallet = hdkey.fromMasterSeed(await bip39.mnemonicToSeed(mnemonics))
  const result = []
  for (let i = 0; i < n; i++) {
    const node = hdwallet.derivePath(`m/44'/60'/0'/0/${i + hdPathIndex}`)
    result.push(node.getWallet())
  }
  return result;
}

// ether to wei conversion function
function etherToWei(ether) {
  return web3.utils.toWei(ether, 'ether');
}

module.exports = async function(done) {
    console.log("Deploying seed data to Ethership...");

    let accounts = await web3.eth.getAccounts();
    let owner_account = accounts[0];

    const shipperWallets = await generateWallets("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat", 3);

    const shipperNames = {
        0: "DHL",
        1: "POST",
        2: "FEDEX"
    }

    // big section banner using console log and dashes
    console.log("\n--------------------------------------------");
    console.log("\nUSER ROLES WALLETS ");
    console.log("\n--------------------------------------------");

    console.log("\nShippers Wallets:");
    for (let i = 0; i < shipperWallets.length; i++) {
        console.log(`Shipper #[${i}] Pub Address: ` + shipperWallets[i].getChecksumAddressString() + " (" + shipperNames[i] + ")");
        console.log(`Shipper #[${i}] Private Key: ` + shipperWallets[i].getPrivateKeyString());
    }

    console.log("\nBuyer Wallet:");
    const buyer_wallet = await web3.eth.accounts.create(web3.utils.randomHex(32));
    console.log(`Optional Extra Seller Pub Address: ` + buyer_wallet.address);
    console.log(`Optional Extra Seller Private Key: ` + buyer_wallet.privateKey);

    console.log("\nOptional Extra Seller Wallet:");
    const additional_seller_wallet = await web3.eth.accounts.create(web3.utils.randomHex(32));
    console.log(`Optional Extra Seller Pub Address: ` + additional_seller_wallet.address);
    console.log(`Optional Extra Seller Private Key: ` + additional_seller_wallet.privateKey);


    const instance = await Ethership.deployed();

    console.log("\n--------------------------------------------");
    console.log("\nSEEDING INITAL DATA TO SMART CONTRACT ");
    console.log("\n--------------------------------------------");

    // Register Shippers
    console.log("\nInitial createShipper calls:");
    const create_shipper_tx_1 = await instance.createShipper(shipperNames[0], shipperWallets[0].getChecksumAddressString());
    console.log("createShipper Transaction(1):", create_shipper_tx_1.tx);

    const create_shipper_tx_2 = await instance.createShipper(shipperNames[1], shipperWallets[1].getChecksumAddressString());
    console.log("createShipper Transaction(2):", create_shipper_tx_2.tx);

    const create_shipper_tx_3 = await instance.createShipper(shipperNames[2], shipperWallets[2].getChecksumAddressString());
    console.log("createShipper Transaction(3):", create_shipper_tx_3.tx);


    // Create Shipments Transactions
    console.log("\nInitial createShipment calls:");

    const create_shipment_tx_1 = await instance.createShipment(etherToWei('0.1'), "5 barrels of oil", {from: owner_account});
    console.log("createShipment Transaction(1):", create_shipment_tx_1.tx);

    const create_shipment_tx_2 = await instance.createShipment(etherToWei('0.4'), "22 barrels of oil", {from: owner_account});
    console.log("createShipment Transaction(2):", create_shipment_tx_2.tx);

    const create_shipment_tx_3 = await instance.createShipment(etherToWei('0.8'), "48 barrels of oil", {from: owner_account});
    console.log("createShipment Transaction(3):", create_shipment_tx_3.tx);

    console.log("\n--------------------------------------------");
    console.log("\nINITIAL FUNDING FOR USERS WITH ETHER ");
    console.log("\n--------------------------------------------");

    console.log("\nFunding Shippers with 0.01 ETH each:");
    const shipper_tx_fund_1 = await web3.eth.sendTransaction({to:shipperWallets[0].getChecksumAddressString(), from:owner_account, value: web3.utils.toWei('0.01', 'ether')});
    console.log(`${truncateEthAddress(shipperWallets[0].getChecksumAddressString())} 0.01 ETH funding tx: ` + shipper_tx_fund_1.transactionHash);
    const shipper_tx_fund_2 = await web3.eth.sendTransaction({to:shipperWallets[1].getChecksumAddressString(), from:owner_account, value: web3.utils.toWei('0.01', 'ether')});
    console.log(`${truncateEthAddress(shipperWallets[1].getChecksumAddressString())} 0.01 ETH funding tx: ` + shipper_tx_fund_2.transactionHash);
    const shipper_tx_fund_3 = await web3.eth.sendTransaction({to:shipperWallets[2].getChecksumAddressString(), from:owner_account, value: web3.utils.toWei('0.01', 'ether')})
    console.log(`${truncateEthAddress(shipperWallets[2].getChecksumAddressString())} 0.01 ETH funding tx: ` + shipper_tx_fund_3.transactionHash);

    console.log("\nFunding Buyer with 2 ETH:");
    const buyer_tx_fund = await web3.eth.sendTransaction({to:buyer_wallet.address, from:owner_account, value: web3.utils.toWei('2', 'ether')})
    console.log(`${truncateEthAddress(buyer_wallet.address)} 2 ETH funding tx: ` + buyer_tx_fund.transactionHash);


    console.log("\nFunding Optional Seller with 0.02 ETH:");
    const seller_tx_fund = await web3.eth.sendTransaction({to:additional_seller_wallet.address, from:owner_account, value: web3.utils.toWei('0.02', 'ether')})
    console.log(`${truncateEthAddress(additional_seller_wallet.address)} 0.02 ETH funding tx: ` + seller_tx_fund.transactionHash);


    // Move and replace file from ./build/contracts/Ethership.json to ./src/contracts/Ethership.json
    require('fs').copyFileSync('./build/contracts/Ethership.json', './src/contracts/Ethership.json');

    done();
};