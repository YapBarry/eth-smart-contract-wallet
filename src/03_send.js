import { getDefaultProvider, Wallet, parseEther } from "ethers";

// Function to send ETH in React
export default async function sendEth(privateKeyHex, _receiverAddress, _ethAmount) {
  try {
    const network = "https://1rpc.io/sepolia"; // or whichever network you're using
    const provider = getDefaultProvider(network);

    // Create a signer using the private key and provider
    const signer = new Wallet(privateKeyHex, provider);

    // Send the transaction
    const transaction = await signer.sendTransaction({
      to: _receiverAddress,
      value: parseEther(_ethAmount),
    });

    // Return transaction result
    console.log(transaction);
    return transaction;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error; // Re-throw error to handle it in React
  }
}
