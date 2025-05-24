import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Tooltip from '@mui/material/Tooltip';

function Navbar({ mode, setMode }) {
  const location = useLocation();
  const navLinks = [
    { label: 'Карты', to: '/cards', icon: <CreditCardIcon sx={{ fontSize: 22, color: 'inherit', verticalAlign: 'middle', mr: 1 }} /> },
    { label: 'Вклады', to: '/deposits', icon: <SavingsIcon sx={{ fontSize: 22, color: 'inherit', verticalAlign: 'middle', mr: 1 }} /> },
    { label: 'Кредиты', to: '/credits', icon: <AccountBalanceIcon sx={{ fontSize: 22, color: 'inherit', verticalAlign: 'middle', mr: 1 }} /> },
    { label: 'Клиенты', to: '/clients', icon: <PersonIcon sx={{ fontSize: 22, color: 'inherit', verticalAlign: 'middle', mr: 1 }} /> },
    { label: 'Транзакции', to: '/transactions', icon: <ReceiptIcon sx={{ fontSize: 22, color: 'inherit', verticalAlign: 'middle', mr: 1 }} /> },
  ];

  return (
    <AppBar position="sticky" elevation={2} sx={{ background: 'linear-gradient(90deg, #003366 0%, #00539B 100%)', boxShadow: '0 4px 24px 0 rgba(0,51,102,0.10)', zIndex: 1201 }}>
      <Toolbar sx={{ minHeight: 68 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 3,
            position: 'relative',
            '&:hover': {
              '&::after': {
                transform: 'scale(1.2)',
                opacity: 1
              }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              background: 'linear-gradient(45deg, #003366 30%, #0077cc 100%)',
              borderRadius: '12px',
              opacity: 0,
              transition: 'all 0.4s ease-in-out',
              transform: 'scale(0.8)',
              zIndex: -1,
              filter: 'blur(10px)'
            }
          }}>
            <AccountBalanceIcon sx={{ 
              fontSize: 36, 
              color: 'white', 
              mr: 1,
              transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1.15) translateY(-2px)',
                  filter: 'brightness(1)'
                },
                '50%': {
                  transform: 'scale(1.2) translateY(-2px)',
                  filter: 'brightness(1.15)'
                },
                '100%': {
                  transform: 'scale(1.15) translateY(-2px)',
                  filter: 'brightness(1)'
                }
              },
              '&:hover': {
                transform: 'scale(1.15) translateY(-2px)',
                filter: 'drop-shadow(0 0 10px rgba(0,119,204,0.7))',
                animation: 'pulse 1.5s infinite'
              }
            }} />
            <Typography 
              variant="h5" 
              component={RouterLink} 
              to="/" 
              sx={{ 
                textDecoration: 'none', 
                color: 'white', 
                fontWeight: 800, 
                letterSpacing: 1,
                transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                position: 'relative',
                '&:hover': {
                  color: '#fff',
                  transform: 'translateY(-2px)',
                  textShadow: '0 2px 10px rgba(0,119,204,0.3)',
                  '&::before': {
                    transform: 'scaleX(1)',
                    opacity: 0.9
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #003366 30%, #0077cc 100%)',
                  transform: 'scaleX(0)',
                  opacity: 0,
                  transition: 'all 0.4s ease-in-out',
                  transformOrigin: 'left'
                }
              }}>
              Nexus Bank
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Button
              key={link.to}
              color="inherit"
              component={RouterLink}
              to={link.to}
              sx={{
                fontWeight: 700,
                fontSize: 17,
                mx: 0.5,
                px: 2.2,
                py: 1.1,
                borderRadius: 2,
                background: location.pathname.startsWith(link.to) ? 'rgba(255,255,255,0.13)' : 'transparent',
                boxShadow: 'none',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                color: '#fff',
                '&:hover': {
                  background: 'rgba(255,255,255,0.18)',
                  color: '#e3eafc',
                  transform: 'translateY(-1px)',
                }
              }}
              disableElevation
            >
              {link.icon}
              {link.label}
            </Button>
          ))}
          <Box sx={{ 
            position: 'relative', 
            ml: 2,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tooltip title={mode === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}>
              <IconButton
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                sx={{
                  p: 1,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.18)',
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                {mode === 'dark' ? (
                  <Brightness7Icon sx={{ 
                    color: '#fff',
                    fontSize: 24,
                    transition: 'all 0.3s ease-in-out',
                    transform: 'rotate(0deg)',
                    '&:hover': { transform: 'rotate(180deg)' }
                  }} />
                ) : (
                  <Brightness4Icon sx={{ 
                    color: '#fff',
                    fontSize: 24,
                    transition: 'all 0.3s ease-in-out',
                    transform: 'rotate(0deg)',
                    '&:hover': { transform: 'rotate(180deg)' }
                  }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 