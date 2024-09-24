import React from 'react';
import { Card, CardContent, TextField, Button, Typography } from '@mui/material';

const Login = ({
  password,
  setPassword,
  setPrivateKey,
  setAddress1,
  setIsLoggedIn,
  setImportedERC20TokenList,
}) => {
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.privateKey) {
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
        alert('Incorrect password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h2">Login</Typography>
        <TextField
          type="password"
          label="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Log In
        </Button>
      </CardContent>
    </Card>
  );
};

export default Login;
