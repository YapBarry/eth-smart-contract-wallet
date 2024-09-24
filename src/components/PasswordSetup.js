import React from 'react';
import { Card, CardContent, TextField, Button, Typography } from '@mui/material';

const PasswordSetup = ({ password, setPassword, setIsFirstTime, setIsLoggedIn }) => {
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

  return (
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
  );
};

export default PasswordSetup;
