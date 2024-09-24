import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const TokenList = ({ importedERC20TokenList }) => (
  <div>
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
  </div>
);

export default TokenList;
