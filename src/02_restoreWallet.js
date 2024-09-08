const { mnemonicToEntropy } = require("ethereum-cryptography/bip39");
const { wordlist } = require("ethereum-cryptography/bip39/wordlists/english");
const { HDKey } = require("ethereum-cryptography/hdkey");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { writeFileSync } = require("fs");
const {computeAddress} = require("ethers");
const { hexlify } = require("ethers");

async function main(_mnemonic) {
    const entropy = mnemonicToEntropy(_mnemonic, wordlist);
    const hdRootKey = HDKey.fromMasterSeed(entropy);
    const privateKey = hdRootKey.deriveChild(0).privateKey;
    const publicKey = secp256k1.getPublicKey(privateKey);
    const address = computeAddress(hexlify(publicKey));
    console.log("Account 1 wallet address: ", address);
    
    const accountOne = {
        privateKey: privateKey,
        publicKey: publicKey,
        address: address,
    };
    const accountOneData = JSON.stringify(accountOne);
    writeFileSync("account 1.json", accountOneData);
}

main(process.argv[2]).then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});