import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const AccountDetails = ({ address1, balance, seedPhrase }) => (
  <div>
    {address1 && (
      <Card>
        <CardContent>
          <Typography variant="h4">Your Wallet Address:</Typography>
          <Typography>{address1}</Typography>
          <Typography variant="h4">ETH Balance:</Typography>
          <Typography>{balance} ETH</Typography>
        </CardContent>
      </Card>
    )}
  </div>
);

export default AccountDetails;
