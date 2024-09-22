import React, { useState, useEffect } from 'react';
import { WebSocketProvider, formatEther, formatUnits, ethers } from 'ethers';
import newAccount from './01_newAccount';
import restoreWallet from './02_restoreWallet';
import sendEth from './03_send';
import { Container, Typography, TextField, Button, Card, CardContent, Grid } from '@mui/material';

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
  const [showPrompt, setShowPrompt] = useState(false);
  const [importedERC20TokenList, setImportedERC20TokenList] = useState(() => {
    const savedERC20TokenList = JSON.parse(localStorage.getItem('importedERC20TokenList') || '{}');
    return savedERC20TokenList[localStorage.getItem('address1')] || [];
  });
  const [importedTokenAddress, setImportedTokenAddress] = useState('');
  
  // Update local storage whenever importedERC20TokenList changes
  useEffect(() => {
    if (address1) {
      const savedERC20TokenList = JSON.parse(localStorage.getItem('importedERC20TokenList') || '{}');
      savedERC20TokenList[address1] = importedERC20TokenList;
      localStorage.setItem('importedERC20TokenList', JSON.stringify(savedERC20TokenList));
    }
  }, [importedERC20TokenList, address1]);

  useEffect(() => {
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

    const alchemyWsUrl = `wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`;
    const wsProvider = new WebSocketProvider(alchemyWsUrl);

    const updateBalance = async () => {
      try {
        const balance = await wsProvider.getBalance(address1, 'latest');
        console.log('Balance fetched:', formatEther(balance));
        setBalance(parseFloat(formatEther(balance)).toFixed(4));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    updateBalance();

    wsProvider.on('block', async (blockNumber) => {
      console.log('New block:', blockNumber);
      await updateBalance();
      importedERC20TokenList.forEach(token => {
        getERC20TokenBalance(address1, token.tokenContractAddress, wsProvider);
      });
    });

    return () => {
      wsProvider.removeAllListeners('block');
    };
  }, [address1, importedERC20TokenList]);

  useEffect(() => {
    if (address1) {
      const provider = new WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
      importedERC20TokenList.forEach(token => {
        getERC20TokenBalance(address1, token.tokenContractAddress, provider);
      });
    }
  }, [address1]);

  const getERC20TokenBalance = async (walletAddress, tokenContractAddress, provider) => {
    const ERC20_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function symbol() view returns (string)"
    ];

    try {
      const tokenContract = new ethers.Contract(tokenContractAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      const symbol = await tokenContract.symbol();
      const balanceFormatted = formatUnits(balance, 18);

      setImportedERC20TokenList(prevList => [
        ...prevList.filter(token => token.tokenContractAddress !== tokenContractAddress),
        { tokenSymbol: symbol, tokenContractAddress: tokenContractAddress, balance: balanceFormatted }
      ]);

    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  const handleLogOut = async () => {
    setIsLoggedIn(false);
  };

  const handleImportToken = async () => {
    console.log("address1 is...", address1);
    if (!address1 || !importedTokenAddress) {
      alert('Please provide an Ethereum address and token contract address.');
      return;
    }

    console.log("importedERC20TokenList before appending is", importedERC20TokenList);

    const provider = new WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
    await getERC20TokenBalance(address1, importedTokenAddress, provider);

    const ERC20_ABI = ["event Transfer(address indexed from, address indexed to, uint amount)"];
    const tokenContract = new ethers.Contract(importedTokenAddress, ERC20_ABI, provider);

    tokenContract.on("Transfer", (from, to) => {
      if (from === address1 || to === address1) {
        getERC20TokenBalance(address1, importedTokenAddress, provider);
      }
    });
  };

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

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.privateKey) {
        console.log("data is...", data);
        const privateKeyArray = Object.values(data.privateKey);
        const privateKeyHex = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');

        setPrivateKey(privateKeyHex);
        setAddress1(data.address1);
        const savedERC20TokenList = localStorage.getItem('importedERC20TokenList') || '{}';
        const parsedSavedERC20TokenList = JSON.parse(savedERC20TokenList);
        setImportedERC20TokenList(parsedSavedERC20TokenList[data.address1] || []);
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

  const handleCreateAccount = async () => {
    try {
      const response = await newAccount();
      const parsedData = JSON.parse(response.receivedData);
      setSeedPhrase(parsedData.seedPhrase);

      const privateKeyArray = Object.values(parsedData.privateKey);
      const privateKeyHex = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');

      setPrivateKey(privateKeyHex);
      setAddress1(parsedData.address);
      setImportedERC20TokenList([]);

      localStorage.setItem('privateKey', privateKeyHex);
      localStorage.setItem('address1', parsedData.address);

      setShowPrompt(false);
    } catch (error) {
      console.error('handleCreateAccount__Error creating account:', error);
    }
  };

  const handleRestoreWallet = async () => {
    try {
      const response = await restoreWallet(inputSeedPhrase);
      const parsedData = JSON.parse(response.receivedData);
      setSeedPhrase(parsedData.seedPhrase);

      const privateKeyArray = Object.values(parsedData.privateKey);
      const privateKeyHex = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');

      setPrivateKey(privateKeyHex);
      setAddress1(parsedData.address);
      const savedERC20TokenList = localStorage.getItem('importedERC20TokenList') || '{}';
      const parsedSavedERC20TokenList = JSON.parse(savedERC20TokenList);
      setImportedERC20TokenList(parsedSavedERC20TokenList[parsedData.address] || []);

      localStorage.setItem('privateKey', privateKeyHex);
      localStorage.setItem('address1', parsedData.address);

      setShowPrompt(false);
    } catch (error) {
      console.error('handleRestoredWallet__Error restoring wallet:', error);
    }
  };

  const handleSendEth = async () => {
    if (!privateKey) {
      setShowPrompt(true);
      return;
    }
    try {
      if (!inputReceiverAddress || !inputEthAmount) {
        alert("Please enter both receiver address and ETH amount");
        return;
      }
      const transaction = await sendEth(privateKey, inputReceiverAddress, inputEthAmount);
      console.log("Transaction successful! Transaction Hash: ", transaction);
      alert(`Transaction successful! Transaction Hash: ${transaction.hash}`);
    } catch (error) {
      console.error('Error sending ETH:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h1">Smart Contract Wallet</Typography>
    
      {!isLoggedIn ? (
        isFirstTime ? (
          <Card>
            <CardContent>
              <Typography variant="h2">Set your password</Typography>
              <TextField
                type="password"
                label="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" color="primary" onClick={handleSetPassword}>
                Set Password
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h2">Enter your password</Typography>
              <TextField
                type="password"
                label="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" color="primary" onClick={handleLogin}>
                Login
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div>
          <Typography variant="h3">Create New Account</Typography>
          <Button variant="contained" color="primary" onClick={handleCreateAccount}>
            Create New Account
          </Button>
    
          <Typography variant="h3">Restore Wallet</Typography>
          <TextField
            type="text"
            label="Enter Seed Phrase"
            value={inputSeedPhrase}
            onChange={(e) => setInputSeedPhrase(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleRestoreWallet}>
            Restore Wallet
          </Button>
    
          {seedPhrase && (
            <Card>
              <CardContent>
                <Typography variant="h4">Your Seed Phrase:</Typography>
                <Typography>{seedPhrase}</Typography>
              </CardContent>
            </Card>
          )}
    
          {address1 && (
            <Card key="123">
              <CardContent>
                <Typography variant="h4">Your Wallet Address:</Typography>
                <Typography>{address1}</Typography>
                <Typography variant="h4">Your Private Key:</Typography>
                <Typography>{privateKey}</Typography>
                <Typography variant="h4">ETH Balance:</Typography>
                <Typography>{balance} ETH</Typography>
              </CardContent>
            </Card>
          )}
    
          <Typography variant="h3">Import Token</Typography>
          <TextField
            type="text"
            label="Enter Token Contract Address"
            value={importedTokenAddress}
            onChange={(e) => setImportedTokenAddress(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleImportToken}>
            Import Token
          </Button>
          {Array.isArray(importedERC20TokenList) && importedERC20TokenList.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h4">Imported ERC20 Tokens:</Typography>
                {importedERC20TokenList.map(({ tokenSymbol, tokenContractAddress, balance }) => (
                  <div key={tokenContractAddress}>
                    <Typography>Token: {tokenSymbol}</Typography>
                    <Typography>Address: {tokenContractAddress}</Typography>
                    <Typography>Balance: {balance}</Typography>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <Typography variant="h3">Send ETH</Typography>
          {showPrompt && <Typography>Please create or restore a wallet before sending ETH.</Typography>}
          <TextField
            type="text"
            label="Enter receiver address"
            value={inputReceiverAddress}
            onChange={(e) => setInputReceiverAddress(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            type="text"
            label="Enter ETH amount"
            value={inputEthAmount}
            onChange={(e) => setInputEthAmount(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleSendEth}>
            Send ETH
          </Button>
          <Button variant="contained" color="secondary" onClick={handleLogOut}>
            Log Out
          </Button>
        </div>
      )}
    </Container>
  );
}

export default App;