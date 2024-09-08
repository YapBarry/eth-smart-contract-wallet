const { getDefaultProvider, Wallet, parseEther } = require("ethers");
const { readFileSync } = require("fs");

async function main(_receiverAddress, _ethAmount) {
    const network = "sepolia";
    const provider = getDefaultProvider(network);
    const accountRawData = readFileSync("account 1.json", "utf8");
    const accountData = JSON.parse(accountRawData);
    const privateKey = Object.values(accountData.privateKey);
  
    // To convert privateKey from uint8array to hexadecimal as Wallet() only accepts hexadecimal input
    const privateKeyHex = privateKey.map(byte => byte.toString(16).padStart(2, '0')).join(''); 
    //   console.log(privateKeyHex);
  
    const signer = new Wallet(privateKeyHex, provider);
    const transaction = await signer.sendTransaction({
        to: _receiverAddress,
        value: parseEther(_ethAmount),
    });

    console.log(transaction);
}

main(process.argv[2], process.argv[3])
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });