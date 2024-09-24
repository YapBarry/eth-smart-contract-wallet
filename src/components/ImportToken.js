import React from 'react';
import { ethers } from 'ethers';  // <-- Add this import statement
import { TextField, Button, Typography } from '@mui/material';

const ImportToken = ({
  address1,
  importedTokenAddress,
  setImportedTokenAddress,
  importedERC20TokenList,
  setImportedERC20TokenList,
  getERC20TokenBalance,
}) => {
  const handleImportToken = async () => {
    if (!address1 || !importedTokenAddress) {
      alert('Please provide an Ethereum address and token contract address.');
      return;
    }

    const provider = new ethers.WebSocketProvider(
      `wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`
    );

    await getERC20TokenBalance(address1, importedTokenAddress, provider);
  };

  return (
    <div>
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
    </div>
  );
};

export default ImportToken;
