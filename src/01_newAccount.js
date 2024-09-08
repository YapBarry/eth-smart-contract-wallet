// const { generateMnemonic, mnemonicToEntropy } = require("ethereum-cryptography/bip39");
import { generateMnemonic, mnemonicToEntropy } from 'ethereum-cryptography/bip39';
// const { wordlist } = require("ethereum-cryptography/bip39/wordlists/english");
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english";
// const { HDKey } = require("ethereum-cryptography/hdkey");
import { HDKey } from "ethereum-cryptography/hdkey";
// const { secp256k1 } = require("ethereum-cryptography/secp256k1");
import { secp256k1 } from "ethereum-cryptography/secp256k1";
// const {computeAddress} = require("ethers");
// const { hexlify } = require("ethers");
import {computeAddress, hexlify} from "ethers";

// // save the private/public key pairs and public address info and save it into a json file
// function _store(_privateKey, _publicKey, _address) {
//     const accountOne = {
//         privateKey: _privateKey,
//         publicKey: _publicKey,
//         address: _address,
//     };

//     const accountOneData = JSON.stringify(accountOne);
//     // fs.writeFileSync( File_Path, Data, Options )
//     writeFileSync("account 1.json", accountOneData);
// }

function _generateMnemonic() {
    const strength = 256; // 256 bits, 24 words; default is 128 bits, 12 words
    const mnemonic = generateMnemonic(wordlist, strength);
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    return { mnemonic, entropy };
}

// get rootkey from seedphrase
function _getHdRootKey(_mnemonic) {
    return HDKey.fromMasterSeed(_mnemonic);
}

// get private keys for accounts tied to the same rootkey/ seedphrase
function _generatePrivateKey(_hdRootKey, _accountIndex) {
    return _hdRootKey.deriveChild(_accountIndex).privateKey;
}

function _getPublicKey(_privateKey) {
    return secp256k1.getPublicKey(_privateKey);
}

// we get eth address by applying Keccak-256 to the public key and then taking the last 20 bytes of the result
function _getEthAddress(_publicKey) {
    return computeAddress(hexlify(_publicKey));
}

// generate new seedphrase and the first account out of it
async function main() {
    const { mnemonic, entropy } = _generateMnemonic();
    console.log(`WARNING! Never disclose your Seed Phrase:\n ${mnemonic}`);

    const hdRootKey = _getHdRootKey(entropy);
    const accountOneIndex = 0;
    const accountOnePrivateKey = _generatePrivateKey(hdRootKey, accountOneIndex);
    const accountOnePublicKey = _getPublicKey(accountOnePrivateKey);
    const accountOneAddress = _getEthAddress(accountOnePublicKey);
    console.log("Account 1 Wallet Address: ", accountOneAddress);
    // _store(accountOnePrivateKey, accountOnePublicKey, accountOneAddress);
    const accountOneData = {
        seedPhrase: mnemonic,
        privateKey: accountOnePrivateKey,
        publicKey: accountOnePublicKey,
        address: accountOneAddress,
    };
    // Send seed phrase to the backend using Fetch API
    try {
        const response = await fetch('http://localhost:3001/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(accountOneData ),
        });

        const data = await response.json();
        console.log("Response from backend:", data);
        return data
    } catch (error) {
        console.error("Error sending seed phrase to backend:", error);
    }

}


// export default function newAccount(){
//     main().then(() => process.exit(0)).catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });
// }
export default async function newAccount(){
    try {
        const result = await main(); // Await the result from main()
        return result; // Return the result to App.js
    } catch (error) {
        console.error("Error in account generation:", error);
        throw error; // Rethrow the error for App.js to handle
    }
}


  