import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { WebSocketProvider, formatEther } from 'ethers';

// Import components
import AccountDetails from './components/AccountDetails';
import AccountActions from './components/AccountActions';
import TokenList from './components/TokenList';
import ImportToken from './components/ImportToken';
import PasswordSetup from './components/PasswordSetup';
import Login from './components/Login';
import SendEth from './components/SendEth';

// Import external wallet functions
import newAccount from './01_newAccount';
import restoreWallet from './02_restoreWallet';
import sendEth from './03_send';

function App() {
  const [password, setPassword] = useState(localStorage.getItem('password') || '');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('isLoggedIn'));
  const [privateKey, setPrivateKey] = useState(localStorage.getItem('privateKey') || '');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [address1, setAddress1] = useState(localStorage.getItem('address1') || '');
  const [balance, setBalance] = useState('0');
  const [inputSeedPhrase, setInputSeedPhrase] = useState('');
  const [inputReceiverAddress, setInputReceiverAddress] = useState('');
  const [inputEthAmount, setInputEthAmount] = useState('');
  const [importedERC20TokenList, setImportedERC20TokenList] = useState(() => {
    const savedERC20TokenList = JSON.parse(localStorage.getItem('importedERC20TokenList') || '{}');
    return savedERC20TokenList[localStorage.getItem('address1')] || [];
  });
  const [importedTokenAddress, setImportedTokenAddress] = useState('');

  // Password setup
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
        localStorage.setItem('isLoggedIn', 'true');
      }
    } catch (error) {
      console.error('Error setting password:', error);
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.privateKey) {
        const privateKeyHex = Object.values(data.privateKey).map(num => num.toString(16).padStart(2, '0')).join('');
        setPrivateKey(privateKeyHex);
        setAddress1(data.address1);
        const savedERC20TokenList = JSON.parse(localStorage.getItem('importedERC20TokenList') || '{}');
        setImportedERC20TokenList(savedERC20TokenList[data.address1] || []);
        setIsLoggedIn(true);

        localStorage.setItem('privateKey', privateKeyHex);
        localStorage.setItem('address1', data.address1);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  // Create new account
  const handleCreateAccount = async () => {
    try {
      const response = await newAccount();
      const parsedData = JSON.parse(response.receivedData);
      setSeedPhrase(parsedData.seedPhrase);

      const privateKeyHex = Object.values(parsedData.privateKey).map(num => num.toString(16).padStart(2, '0')).join('');
      setPrivateKey(privateKeyHex);
      setAddress1(parsedData.address);
      setImportedERC20TokenList([]);

      localStorage.setItem('privateKey', privateKeyHex);
      localStorage.setItem('address1', parsedData.address);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  // Restore wallet
  const handleRestoreWallet = async () => {
    try {
      const response = await restoreWallet(inputSeedPhrase);
      const parsedData = JSON.parse(response.receivedData);
      setSeedPhrase(parsedData.seedPhrase);

      const privateKeyHex = Object.values(parsedData.privateKey).map(num => num.toString(16).padStart(2, '0')).join('');
      setPrivateKey(privateKeyHex);
      setAddress1(parsedData.address);
      const savedERC20TokenList = JSON.parse(localStorage.getItem('importedERC20TokenList') || '{}');
      setImportedERC20TokenList(savedERC20TokenList[parsedData.address] || []);

      localStorage.setItem('privateKey', privateKeyHex);
      localStorage.setItem('address1', parsedData.address);
    } catch (error) {
      console.error('Error restoring wallet:', error);
    }
  };

  // Send ETH
  const handleSendEth = async () => {
    if (!privateKey) return;
    try {
      const transaction = await sendEth(privateKey, inputReceiverAddress, inputEthAmount);
      console.log("Transaction successful:", transaction);
      alert(`Transaction successful! Transaction Hash: ${transaction.hash}`);
    } catch (error) {
      console.error('Error sending ETH:', error);
    }
  };

  // Import token
  const handleImportToken = async () => {
    if (!address1 || !importedTokenAddress) {
      alert('Please provide an Ethereum address and token contract address.');
      return;
    }
    console.log("importedERC20TokenList before appending is", importedERC20TokenList);

    // Example token import logic (replace with actual token import logic)
    console.log("Token imported successfully!");

    // Logic to update token list and localStorage after token import
  };

  // Log out
  const handleLogOut = () => {
    setIsLoggedIn(false);
    console.log("Logged out successfully!");
  };

  useEffect(() => {
    // Fetch balance and update every block
    if (!address1) return;
    const alchemyWsUrl = `wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`;
    const wsProvider = new WebSocketProvider(alchemyWsUrl);

    const updateBalance = async () => {
      try {
        const balance = await wsProvider.getBalance(address1, 'latest');
        setBalance(parseFloat(formatEther(balance)).toFixed(4));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    updateBalance();

    wsProvider.on('block', async () => {
      await updateBalance();
    });

    return () => {
      wsProvider.removeAllListeners('block');
    };
  }, [address1]);

  return (
    <Container>
      <Typography variant="h1">Smart Contract Wallet</Typography>
    
      {!isLoggedIn ? (
        isFirstTime ? (
          <PasswordSetup password={password} setPassword={setPassword} handleSetPassword={handleSetPassword} />
        ) : (
          <Login password={password} setPassword={setPassword} handleLogin={handleLogin} />
        )
      ) : (
        <div>
          <AccountActions 
            handleCreateAccount={handleCreateAccount} 
            handleRestoreWallet={handleRestoreWallet} 
            inputSeedPhrase={inputSeedPhrase} 
            setInputSeedPhrase={setInputSeedPhrase} 
          />

          {seedPhrase && <AccountDetails seedPhrase={seedPhrase} address1={address1} balance={balance} />}

          <ImportToken 
            importedTokenAddress={importedTokenAddress} 
            setImportedTokenAddress={setImportedTokenAddress} 
            handleImportToken={handleImportToken} 
          />

          <TokenList importedERC20TokenList={importedERC20TokenList} />

          <SendEth 
            inputReceiverAddress={inputReceiverAddress} 
            inputEthAmount={inputEthAmount} 
            setInputReceiverAddress={setInputReceiverAddress} 
            setInputEthAmount={setInputEthAmount} 
            handleSendEth={handleSendEth} 
            handleLogOut={handleLogOut} 
          />
        </div>
      )}
    </Container>
  );
}

export default App;
