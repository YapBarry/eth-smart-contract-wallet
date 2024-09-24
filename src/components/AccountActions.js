import React from 'react';
import { Button, TextField, Typography, Card, CardContent } from '@mui/material';

const AccountActions = ({
  handleCreateAccount,
  handleRestoreWallet,
  seedPhrase,
  inputSeedPhrase,
  setInputSeedPhrase,
  setPrivateKey,
  setAddress1,
  setImportedERC20TokenList,
  setShowPrompt,
}) => {
  const onCreateAccount = async () => {
    try {
      const result = await handleCreateAccount();
      setPrivateKey(result.privateKey);
      setAddress1(result.address);
      setImportedERC20TokenList([]);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const onRestoreWallet = async () => {
    try {
      const result = await handleRestoreWallet(inputSeedPhrase);
      setPrivateKey(result.privateKey);
      setAddress1(result.address);
      setImportedERC20TokenList([]);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error restoring wallet:', error);
    }
  };

  return (
    <div>
      <Typography variant="h3">Create New Account</Typography>
      <Button variant="contained" color="primary" onClick={onCreateAccount}>
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
      <Button variant="contained" color="primary" onClick={onRestoreWallet}>
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
    </div>
  );
};

export default AccountActions;
