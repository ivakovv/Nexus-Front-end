import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import { useTheme } from '@mui/material/styles';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const products = [
    {
      title: 'Банковские карты',
      description: 'Добавляйте, удаляйте и просматривайте карты клиентов банка',
      icon: <CreditCardIcon sx={{ fontSize: 60 }} />,
      path: '/cards'
    },
    {
      title: 'Вклады',
      description: 'Управляйте вкладами клиентов банка',
      icon: <SavingsIcon sx={{ fontSize: 60 }} />,
      path: '/deposits'
    },
    {
      title: 'Кредиты',
      description: 'Управляйте кредитами клиентов банка',
      icon: <AccountBalanceIcon sx={{ fontSize: 60 }} />,
      path: '/credits'
    },
    {
      title: 'Клиенты',
      description: 'Управляйте информацией о клиентах банка',
      icon: <PeopleIcon sx={{ fontSize: 60 }} />,
      path: '/clients'
    },
    {
      title: 'Транзакции',
      description: 'Просматривайте историю транзакций клиентов банка',
      icon: <ReceiptIcon sx={{ fontSize: 60 }} />,
      path: '/transactions'
    }
  ];

  const firstRow = products.slice(0, 3);
  const secondRow = products.slice(3, 6);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #181C24 0%, #1F2937 100%)' 
        : 'linear-gradient(135deg, #F5F7FA 0%, #E5E9F2 100%)',
      py: 6,
      overflow: 'hidden'
    }}>
      <Container maxWidth="md" sx={{ 
        mb: 4,
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.8s ease-out',
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: 1,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, #fff 0%, #e3eafc 100%)'
              : 'linear-gradient(90deg, #003366 0%, #00539B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}
        >
          Добро пожаловать в Nexus Bank
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary" 
          paragraph 
          sx={{ 
            mb: 2,
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.8s ease-out 0.2s',
          }}
        >
          Выберите нужный вам банковский продукт
        </Typography>
      </Container>

      {/* Первый ряд — 3 карточки */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
        {firstRow.map((product, idx) => (
          <Box 
            key={product.title} 
            sx={{ 
              width: { xs: '100%', sm: 260, md: 300 }, 
              mb: { xs: 2, md: 0 },
              opacity: showContent ? 1 : 0,
              transform: showContent ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.8s ease-out ${0.2 + idx * 0.1}s`,
            }}
          >
            <Card sx={{
              minHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 24px 0 rgba(0,51,102,0.13)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 36px 0 rgba(0,51,102,0.18)',
                transform: 'translateY(-8px) scale(1.02)',
                '& .icon-animation': {
                  transform: 'scale(1.1) rotate(10deg)',
                }
              },
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1a1d23 0%, #232936 100%)' 
                : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              p: 0
            }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', width: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
                <Box 
                  className="icon-animation"
                  sx={{ 
                    mb: 2, 
                    color: 'primary.main', 
                    display: 'flex', 
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                >
                  {React.cloneElement(product.icon, { 
                    sx: { 
                      fontSize: 54, 
                      color: theme.palette.mode === 'dark' ? '#e3eafc' : 'primary.main',
                      filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(227,234,252,0.3))' : 'none',
                    } 
                  })}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2, minHeight: 40 }}>
                  {product.description}
                </Typography>
              </CardContent>
              <Box sx={{ width: '100%', px: 3, pb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(product.path)}
                  fullWidth
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    borderRadius: 2,
                    boxShadow: 'none',
                    py: 1.1,
                    background: 'linear-gradient(90deg, #003366 0%, #00539B 100%)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #00539B 0%, #003366 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,51,102,0.2)',
                    }
                  }}
                >
                  Подробнее
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Второй ряд — 2 карточки */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
        {secondRow.map((product, idx) => (
          <Box 
            key={product.title} 
            sx={{ 
              width: { xs: '100%', sm: 260, md: 300 }, 
              mb: { xs: 2, md: 0 },
              opacity: showContent ? 1 : 0,
              transform: showContent ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.8s ease-out ${0.5 + idx * 0.1}s`,
            }}
          >
            <Card sx={{
              minHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 24px 0 rgba(0,51,102,0.13)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 12px 36px 0 rgba(0,51,102,0.18)',
                transform: 'translateY(-8px) scale(1.02)',
                '& .icon-animation': {
                  transform: 'scale(1.1) rotate(10deg)',
                }
              },
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1a1d23 0%, #232936 100%)' 
                : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              p: 0
            }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', width: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
                <Box 
                  className="icon-animation"
                  sx={{ 
                    mb: 2, 
                    color: 'primary.main', 
                    display: 'flex', 
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                >
                  {React.cloneElement(product.icon, { 
                    sx: { 
                      fontSize: 54, 
                      color: theme.palette.mode === 'dark' ? '#e3eafc' : 'primary.main',
                      filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(227,234,252,0.3))' : 'none',
                    } 
                  })}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2, minHeight: 40 }}>
                  {product.description}
                </Typography>
              </CardContent>
              <Box sx={{ width: '100%', px: 3, pb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(product.path)}
                  fullWidth
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    borderRadius: 2,
                    boxShadow: 'none',
                    py: 1.1,
                    background: 'linear-gradient(90deg, #003366 0%, #00539B 100%)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #00539B 0%, #003366 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,51,102,0.2)',
                    }
                  }}
                >
                  Подробнее
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Home; 