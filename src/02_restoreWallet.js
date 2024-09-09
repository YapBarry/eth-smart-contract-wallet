// const { mnemonicToEntropy } = require("ethereum-cryptography/bip39");
// const { wordlist } = require("ethereum-cryptography/bip39/wordlists/english");
// const { HDKey } = require("ethereum-cryptography/hdkey");
// const { secp256k1 } = require("ethereum-cryptography/secp256k1");
// const { writeFileSync } = require("fs");
// const {computeAddress} = require("ethers");
// const { hexlify } = require("ethers");

import { mnemonicToEntropy } from "ethereum-cryptography/bip39";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english";
import { HDKey } from "ethereum-cryptography/hdkey";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { computeAddress, hexlify } from "ethers";

async function main(_mnemonic) {
    const entropy = mnemonicToEntropy(_mnemonic, wordlist);
    const hdRootKey = HDKey.fromMasterSeed(entropy);
    const privateKey = hdRootKey.deriveChild(0).privateKey;
    const publicKey = secp256k1.getPublicKey(privateKey);
    const address = computeAddress(hexlify(publicKey));
    console.log("Account 1 wallet address: ", address);
    
    const accountOneData = {
        seedPhrase: _mnemonic,
        privateKey: privateKey,
        publicKey: publicKey,
        address: address,
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

export default async function restoreWallet(_mnemonic){
    try {
        const result = await main(_mnemonic); // Await the result from main()
        return result; // Return the result to App.js
    } catch (error) {
        console.error("Error in wallet restoration:", error);
        throw error; // Rethrow the error for App.js to handle
    }
}