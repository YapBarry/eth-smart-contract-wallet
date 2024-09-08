import React, { useState } from 'react'; // do we need to import React? What's the use? Can do without?
// import newAccount from './01_newAccount';
import newAccount from './01_newAccount';

// use ethereum local node
// const provider = new ethers.providers.Web3Provider(window.ethereum);

function App() {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey1, setPrivateKey1] = useState('');
  const [address1, setAddress1] = useState('');
  // function sendEth() {}
  // function restoreAccountFromSeedPhrase(){}

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
    } catch (error) {
        console.error('handleCreateAccount__Error creating account:', error);
    }
  };
  
  
  return(
    <div>
      <h1>Smart Contract Wallet</h1>
      <button
        className="button"
        id="create-account"
        onClick={handleCreateAccount}
      >
        Create New Account
      </button>   
      {/* Display the created seed phrase */}
      {seedPhrase && (
        <div>
          <h3>Your Seedphrase and Private Key:</h3>
          <p>Seedphrase: {seedPhrase}</p>
          <p>Private Key for Account 1: {privateKey1}</p>
          <p>Address for Account 1: {address1}</p>
        </div>
      )} 
    </div>
  )
}

export default App;