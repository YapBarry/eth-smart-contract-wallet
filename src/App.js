import React, { useState } from 'react'; // do we need to import React? What's the use? Can do without?
// import newAccount from './01_newAccount';
import newAccount from './01_newAccount';

// use ethereum local node
// const provider = new ethers.providers.Web3Provider(window.ethereum);

function App() {
  const [seedPhrase, setSeedPhrase] = useState('');
  // function sendEth() {}
  // function restoreAccountFromSeedPhrase(){}

  // Function to handle account creation and updating seed phrase
  const handleCreateAccount = async () => {
    try {
      // Call the newAccount function to create a new account
      const response = await newAccount();
      console.log("response in try block is..", response)
      
      // Assuming response contains the seed phrase in response.seedPhrase
      setSeedPhrase(response.seedPhrase);
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
          <h3>Your Seed Phrase:</h3>
          <p>{seedPhrase}</p>
        </div>
      )} 
    </div>
  )
}

export default App;