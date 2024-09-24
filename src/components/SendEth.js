import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import sendEth from '../03_send'; // <-- Import sendEth from the correct file

const SendEth = ({ privateKey, setShowPrompt, showPrompt }) => {
  const [inputReceiverAddress, setInputReceiverAddress] = useState('');
  const [inputEthAmount, setInputEthAmount] = useState('');

  const handleSendEth = async () => {
    if (!privateKey) {
      setShowPrompt(true);
      return;
    }

    try {
      if (!inputReceiverAddress || !inputEthAmount) {
        alert('Please enter both receiver address and ETH amount');
        return;
      }
      const transaction = await sendEth(privateKey, inputReceiverAddress, inputEthAmount);
      alert(`Transaction successful! Transaction Hash: ${transaction.hash}`);
    } catch (error) {
      console.error('Error sending ETH:', error);
    }
  };

  return (
    <div>
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
    </div>
  );
};

export default SendEth;
