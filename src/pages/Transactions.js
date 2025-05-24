import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { bankService } from '../services/api';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('датаСоздания');
  const [sortOrder, setSortOrder] = useState('desc');
  const [typeFilter, setTypeFilter] = useState('Все');
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const animationStyles = {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    '@keyframes slideUp': {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    }
  };

  useEffect(() => {
    fetchTransactions();
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await bankService.getTransactions();
      setTransactions(response.data);
    } catch (err) {
      setError('Не удалось загрузить историю транзакций');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const transactionTypes = Array.from(new Set(transactions.map(t => t.типТранзакции))).filter(Boolean);

  const filteredTransactions = typeFilter === 'Все'
    ? transactions
    : transactions.filter(t => t.типТранзакции === typeFilter);

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === 'датаСоздания') {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    }
    if (sortBy === 'сумма') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    return 0;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4,
      opacity: showContent ? 1 : 0,
      transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
      transition: 'all 0.5s ease-out',
      ...animationStyles
    }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3, 
        justifyContent: 'space-between',
        animation: 'fadeIn 0.7s ease-out'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <ReceiptIcon sx={{ 
            fontSize: 40, 
            color: 'primary.main',
            animation: 'slideUp 0.7s ease-out'
          }} />
          <Typography variant="h4" component="h1" sx={{
            animation: 'slideUp 0.7s ease-out',
            fontWeight: 700
          }}>
            История транзакций
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ 
            fontWeight: 700, 
            borderRadius: 2, 
            py: 1, 
            px: 3,
            animation: 'fadeIn 0.7s ease-out'
          }} 
          onClick={() => navigate('/transactions/stats')}
        >
          Посмотреть статистику
        </Button>
        <FormControl sx={{ 
          minWidth: 220,
          animation: 'fadeIn 0.7s ease-out'
        }} size="small">
          <InputLabel id="type-filter-label">Тип операции</InputLabel>
          <Select
            labelId="type-filter-label"
            value={typeFilter}
            label="Тип операции"
            onChange={e => setTypeFilter(e.target.value)}
          >
            <MenuItem value="Все">Все</MenuItem>
            {transactionTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {error && (
        <Typography color="error" gutterBottom sx={{ animation: 'fadeIn 0.5s ease-out' }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 4, 
        boxShadow: 3, 
        background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff',
        animation: 'slideUp 0.7s ease-out',
        overflow: 'hidden'
      }}>
        <Table sx={{ 
          minWidth: 650, 
          background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff'
        }}>
          <TableHead>
            <TableRow sx={{ 
              background: theme.palette.mode === 'dark' ? '#232936' : '#e3eafc',
              animation: 'fadeIn 0.7s ease-out'
            }}>
              <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit', fontWeight: 700 }}>Дата</TableCell>
              <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit', fontWeight: 700 }}>Тип операции</TableCell>
              <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit', fontWeight: 700 }}>Сумма</TableCell>
              <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit', fontWeight: 700 }}>Описание</TableCell>
              <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit', fontWeight: 700 }}>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTransactions.map((transaction, index) => (
              <TableRow 
                key={transaction.кодТранзакции} 
                hover 
                sx={{ 
                  transition: 'background 0.2s', 
                  background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff',
                  '&:hover': { background: theme.palette.mode === 'dark' ? '#232936' : '#e5e9f2' },
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s`
                }}
              >
                <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{transaction.датаСоздания ? new Date(transaction.датаСоздания).toLocaleString() : '—'}</TableCell>
                <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{transaction.типТранзакции}</TableCell>
                <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit', fontWeight: 700 }}>{transaction.сумма} ₽</TableCell>
                <TableCell sx={{ color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>{transaction.направление}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: transaction.статус === 'Исполнена' ? 'success.main' : transaction.статус === 'Выполнена' ? '#2ECC40' : transaction.статус === 'Отклонена' ? '#D32F2F' : '#FFD600', mr: 1 }} />
                    <Box sx={{ fontWeight: 700, color: transaction.статус === 'Исполнена' ? 'success.main' : transaction.статус === 'Выполнена' ? 'success.main' : transaction.статус === 'Отклонена' ? 'error.main' : 'warning.main' }}>
                      {transaction.статус}
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Transactions; 