import React, { useState } from 'react'; // do we need to import React? What's the use? Can do without?
// import newAccount from './01_newAccount';
import newAccount from './01_newAccount';
import restoreWallet from './02_restoreWallet';
import sendEth from './03_send';

// use ethereum local node
// const provider = new ethers.providers.Web3Provider(window.ethereum);

function App() {  
  // For displaying information about the account 
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey1, setPrivateKey1] = useState('');
  const [address1, setAddress1] = useState('');
  
  // for restoreWallet()
  const [inputSeedPhrase, setInputSeedPhrase] = useState('');
  
  // For sendEth
  const [inputReceiverAddress, setInputReceiverAddress] = useState('');
  const [inputEthAmount, setInputEthAmount] = useState('');
  // For sendEth, to make sure user creates or restore a wallet first
  const [showPrompt, setShowPrompt] = useState(false);
  

  // Function to handle account creation and updating seed phrase
  const handleCreateAccount = async () => {
    try {
      // Call the newAccount function to create a new account
      const response = await newAccount();
      // need to parse JSON as response is of a JSON string
      const parsedData = JSON.parse(response.receivedData);
      console.log("parsed data is",parsedData)
      setSeedPhrase(parsedData.seedPhrase);

      // Convert object to array
      const privateKeyArray = Object.values(parsedData.privateKey);
      const privateKeyHex = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');
      setPrivateKey1(privateKeyHex);

      setAddress1(parsedData.address);
      setShowPrompt(false);
    } catch (error) {
        console.error('handleCreateAccount__Error creating account:', error);
    }
  };

  // Function to handle restored wallet using input seed phrase
  const handleRestoreWallet = async () => {
    try {
      const response = await restoreWallet(inputSeedPhrase); // Pass the input seed phrase to restoreWallet
      const parsedData = JSON.parse(response.receivedData);
      console.log("Restored wallet data:", parsedData);
      setSeedPhrase(parsedData.seedPhrase);

      const privateKeyArray = Object.values(parsedData.privateKey);
      const privateKeyHex = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');
      setPrivateKey1(privateKeyHex);

      setAddress1(parsedData.address);
      setShowPrompt(false);
    } catch (error) {
      console.error('handleRestoredWallet__Error restoring wallet:', error);
    }
  };

  // Function to handle sending ETH
  const handleSendEth = async () => {
    if (!privateKey1) {
      setShowPrompt(true);
      return;
    }    
    try {
      // Ensure receiver address and eth amount are provided
      if (!inputReceiverAddress || !inputEthAmount) {
        alert("Please enter both receiver address and ETH amount");
        return;
      }

      const transaction = await sendEth(privateKey1, inputReceiverAddress, inputEthAmount);
      console.log("Transaction successful! Transasction Hash: ", transaction);
      alert(`Transaction successful! Transasction Hash: ${transaction.hash}`);
    } catch (error) {
      console.error('Error sending ETH:', error);
    }
  };
  
  
  return(
    <div>
      <h1>Smart Contract Wallet</h1>
      <h3>Create New Account</h3>
      <button
        className="button"
        id="create-account"
        onClick={handleCreateAccount}
      >
        Create New Account
      </button>   
      {/* Input field for restoring wallet */}
      <div>
        <h3>Restore Wallet</h3>
        <input
          type="text"
          value={inputSeedPhrase}
          placeholder="Enter Seed Phrase"
          onChange={(e) => setInputSeedPhrase(e.target.value)} // Update state on input change
        />
        <button className="button" id="restore-wallet" onClick={handleRestoreWallet}>
          Restore Wallet
        </button>
      </div>
      {/* Send Eth from Created Account/Restored Account */}
      <div>
        <h3>Send Eth from Created/Restored Account</h3>
        <input
          type="text"
          value={inputReceiverAddress}
          placeholder="Receiver Address"
          onChange={(e) => setInputReceiverAddress(e.target.value)}
        />
        <input
          type="text"
          value={inputEthAmount}
          placeholder="Amount of ETH to send"
          onChange={(e) => setInputEthAmount(e.target.value)}
        />
        <button className="button" id="send-eth" onClick={handleSendEth}>
          Send ETH
        </button>
      </div>
      {/* Display the created seed phrase */}
      {seedPhrase && (
        <div>
          <h3>Your Seedphrase and Private Key:</h3>
          <p>Seedphrase: {seedPhrase}</p>
          <p>Private Key for Account 1: {privateKey1}</p>
          <p>Address for Account 1: {address1}</p>
        </div>
      )} 
      {/* Prompt User to Create or Restore Wallet */}
      {showPrompt && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          <p>Please create or restore a wallet before sending ETH.</p>
        </div>
      )}
    </div>
  )
}

export default App;