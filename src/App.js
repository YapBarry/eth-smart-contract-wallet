import React, { useState, useEffect } from 'react'; // Required for React functional components
import { WebSocketProvider, formatEther, formatUnits, ethers } from 'ethers';
import newAccount from './01_newAccount';
import restoreWallet from './02_restoreWallet';
import sendEth from './03_send';

function App() {  
  // Password management states
  const [password, setPassword] = useState(localStorage.getItem('password') || ''); // Load password from localStorage if exists
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('isLoggedIn')); // Check login status from localStorage
  const [privateKey, setPrivateKey] = useState(localStorage.getItem('privateKey') || '');

  // For displaying information about the account 
  const [seedPhrase, setSeedPhrase] = useState('');
  // const [privateKey1, setPrivateKey1] = useState(''); // ***** check if we still need this ********
  const [address1, setAddress1] = useState('');
  const [balance, setBalance] = useState('0'); // New: State for balance

  // for restoreWallet()
  const [inputSeedPhrase, setInputSeedPhrase] = useState('');
  
  // For sendEth
  const [inputReceiverAddress, setInputReceiverAddress] = useState('');
  const [inputEthAmount, setInputEthAmount] = useState('');
  // For sendEth, to make sure user creates or restores a wallet first
  const [showPrompt, setShowPrompt] = useState(false);

  // For token import
  const [importedTokenAddress, setImportedTokenAddress] = useState('');
  const [importedTokenBalance, setImportedTokenBalance] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  
  
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

  useEffect(() => {
    if (!address1) return;

    // New: Set up Alchemy WebSocket provider
    const alchemyWsUrl = `wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`; // Use your Alchemy WebSocket URL from .env
    const wsProvider = new WebSocketProvider(alchemyWsUrl); // New: WebSocket connection to Alchemy

    // New: Function to update balance
    const updateBalance = async () => {
      try {
        const balance = await wsProvider.getBalance(address1, 'latest'); // New: Fetch balance
        console.log('Balance fetched:', formatEther(balance)); // Debug log
        setBalance(parseFloat(formatEther(balance)).toFixed(4)); // Convert balance from wei to ether and format to 4 decimals
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    updateBalance(); // Initial balance fetch

    // New: Listen for new blocks and update balance
    wsProvider.on('block', async (blockNumber) => {
      console.log('New block:', blockNumber); // Log block number
      await updateBalance(); // Fetch balance when a new block is mined
    });

    // Clean up on component unmount
    return () => {
      wsProvider.removeAllListeners('block'); // Remove listeners when component unmounts
    };
  }, [address1]);

  // Function to get ERC-20 token balance
  const getERC20TokenBalance = async (address, tokenContractAddress, provider) => {
    const ERC20_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function symbol() view returns (string)"
    ];

    try {
      const tokenContract = new ethers.Contract(tokenContractAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(address);
      const symbol = await tokenContract.symbol();

      setImportedTokenBalance(formatUnits(balance, 18)); // Assuming 18 decimals
      setTokenSymbol(symbol); // Update token symbol
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  // Import token and listen for Transfer events
  const handleImportToken = async () => {
    if (!address1 || !importedTokenAddress) {
      alert('Please provide an Ethereum address and token contract address.');
      return;
    }

    const provider = new WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
    await getERC20TokenBalance(address1, importedTokenAddress, provider);

    const ERC20_ABI = ["event Transfer(address indexed from, address indexed to, uint amount)"];
    const tokenContract = new ethers.Contract(importedTokenAddress, ERC20_ABI, provider);

    tokenContract.on("Transfer", (from, to) => {
      if (from === address1 || to === address1) {
        getERC20TokenBalance(address1, importedTokenAddress, provider); // Update balance
      }
    });
  };
  
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
        // localStorage.setItem('password', password); // Store password in localStorage
        localStorage.setItem('isLoggedIn', 'true'); // Mark the user as logged in in localStorage
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
        localStorage.setItem('privateKey', data.privateKey);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true'); // Store login status in localStorage
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
      console.log("parsed data is", parsedData);
      setSeedPhrase(parsedData.seedPhrase);

      // Convert object to array
      const privateKeyArray = Object.values(parsedData.privateKey);
      const privateKeyHex = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');
      setPrivateKey(privateKeyHex); // ***** check if we still need this ********
      localStorage.setItem('privateKey', privateKeyHex);

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
      localStorage.setItem('privateKey', privateKeyHex);

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
  
  return (
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
          <button onClick={handleRestoreWallet}>Restore Wallet</button>

          {seedPhrase && (
            <div>
              <h4>Your Seed Phrase:</h4>
              <p>{seedPhrase}</p>
            </div>
          )}

          {address1 && (
            <div>
              <h4>Your Wallet Address:</h4>
              <p>{address1}</p>
              <h4>Your Private Key:</h4>
              <p>{privateKey}</p>
              <h4>ETH Balance:</h4> {/* Display balance */}
              <p>{balance} ETH</p>
            </div>
          )}

          {/* Token import section */}
          <h3>Import Token</h3>
          <input
            type="text"
            value={importedTokenAddress}
            placeholder="Enter Token Contract Address"
            onChange={(e) => setImportedTokenAddress(e.target.value)}
          />
          <button onClick={handleImportToken}>Import Token</button>

          {importedTokenBalance && (
            <div>
              <h4>Imported Token Balance:</h4>
              <p>{importedTokenBalance} {tokenSymbol}</p> 
            </div>
          )}
          <h3>Send ETH</h3>
          {showPrompt && <p>Please create or restore a wallet before sending ETH.</p>}
          <input
            type="text"
            value={inputReceiverAddress}
            placeholder="Enter receiver address"
            onChange={(e) => setInputReceiverAddress(e.target.value)}
          />
          <input
            type="text"
            value={inputEthAmount}
            placeholder="Enter ETH amount"
            onChange={(e) => setInputEthAmount(e.target.value)}
          />
          <button onClick={handleSendEth}>Send ETH</button>
        </div>
      )}
    </div>
  );
}

export default App;