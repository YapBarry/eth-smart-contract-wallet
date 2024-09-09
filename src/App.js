import React, { useState, useEffect } from 'react'; // do we need to import React? What's the use? Can do without?
import newAccount from './01_newAccount';
import restoreWallet from './02_restoreWallet';
import sendEth from './03_send';

// use ethereum local node
// const provider = new ethers.providers.Web3Provider(window.ethereum);

function App() {  
  // Password management states
  const [password, setPassword] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [privateKey, setPrivateKey] = useState('');

  // For displaying information about the account 
  const [seedPhrase, setSeedPhrase] = useState('');
  // const [privateKey1, setPrivateKey1] = useState(''); // ***** check if we still need this ********
  const [address1, setAddress1] = useState('');

  // for restoreWallet()
  const [inputSeedPhrase, setInputSeedPhrase] = useState('');
  
  // For sendEth
  const [inputReceiverAddress, setInputReceiverAddress] = useState('');
  const [inputEthAmount, setInputEthAmount] = useState('');
  // For sendEth, to make sure user creates or restore a wallet first
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Check if the password file exists to determine if it's the first time
    const checkFirstTime = async () => {
      try {
        const response = await fetch('http://localhost:3001/check-password');
        if (response.ok) {
          const data = await response.json();
          setIsFirstTime(!data.exists);
        }
      } catch (error) {
        console.error('Error checking first time:', error);
      }
    };

    checkFirstTime();
  }, []);

  // Function to handle setting password
  const handleSetPassword = async () => {
    try {
      const response = await fetch('http://localhost:3001/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.message === 'Password set successfully') {
        alert('Password set successfully!');
        setIsFirstTime(false);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error setting password:', error);
    }
  };

  // Function to handle login
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.privateKey) {
        setPrivateKey(data.privateKey);
        setIsLoggedIn(true);
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

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
      setPrivateKey(privateKeyHex); // ***** check if we still need this ********

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
      setPrivateKey(privateKeyHex); // ***** check if we still need this ********

      setAddress1(parsedData.address);
      setShowPrompt(false);
    } catch (error) {
      console.error('handleRestoredWallet__Error restoring wallet:', error);
    }
  };

  // Function to handle sending ETH
  const handleSendEth = async () => {
    if (!privateKey) { // ***** check if we still need this ********
      setShowPrompt(true);
      return;
    }    
    try {
      // Ensure receiver address and eth amount are provided
      if (!inputReceiverAddress || !inputEthAmount) {
        alert("Please enter both receiver address and ETH amount");
        return;
      }

      const transaction = await sendEth(privateKey, inputReceiverAddress, inputEthAmount); // ***** check if we still need this ********
      console.log("Transaction successful! Transasction Hash: ", transaction);
      alert(`Transaction successful! Transasction Hash: ${transaction.hash}`);
    } catch (error) {
      console.error('Error sending ETH:', error);
    }
  };
  
  
  return(
    <div>
      <h1>Smart Contract Wallet</h1>

      {!isLoggedIn ? (
        isFirstTime ? (
          <div>
            <h2>Set your password</h2>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSetPassword}>Set Password</button>
          </div>
        ) : (
          <div>
            <h2>Enter your password</h2>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
          </div>
        )
      ) : (
        <div>
          <h3>Create New Account</h3>
          <button className="button" id="create-account" onClick={handleCreateAccount}>
            Create New Account
          </button>

          <h3>Restore Wallet</h3>
          <input
            type="text"
            value={inputSeedPhrase}
            placeholder="Enter Seed Phrase"
            onChange={(e) => setInputSeedPhrase(e.target.value)}
          />
          <button className="button" id="restore-wallet" onClick={handleRestoreWallet}>
            Restore Wallet
          </button>

          <h3>Send ETH from Created/Restored Account</h3>
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

          {seedPhrase && (
            <div>
              <h3>Your Seedphrase and Private Key:</h3>
              <p>Seedphrase: {seedPhrase}</p>
              <p>Private Key for Account 1: {privateKey}</p>
              <p>Address for Account 1: {address1}</p>
            </div>
          )}

          {showPrompt && (
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              <p>Please create or restore a wallet before sending ETH.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;