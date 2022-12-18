let bip39 = require('bip39');
let ethereumjs_wallet = require('ethereumjs-wallet');
let {hdkey} = ethereumjs_wallet;


async function generateWallets(mnemonics, n, hdPathIndex = 0) {
  const hdwallet = hdkey.fromMasterSeed(await bip39.mnemonicToSeed(mnemonics))
  const result = []
  for (let i = 0; i < n; i++) {
    const node = hdwallet.derivePath(`m/44'/60'/0'/0/${i + hdPathIndex}`)
    result.push(node.getWallet())
  }
  return result;
}

async function main(){
const shipperWallets = await generateWallets("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat", 3);
console.log({shipperWallets});
console.log(shipperWallets[0].getAddressString());
}

main();