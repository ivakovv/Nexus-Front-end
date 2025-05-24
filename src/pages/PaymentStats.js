import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';

function PaymentStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setTimeout(() => {
        setShowAnimation(true);
      }, 800);
    }
  }, [data]);

  const fetchTransactions = async () => {
    try {
      const response = await bankService.getTransactions();
      // по месяцам и считаем сумму
      const grouped = {};
      response.data.forEach(tx => {
        if (!tx.датаСоздания || !tx.сумма) return;
        const date = new Date(tx.датаСоздания);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[month]) grouped[month] = 0;
        grouped[month] += Number(tx.сумма);
      });
      // массив для графика
      const chartData = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, sum]) => ({ month, sum }));
      setData(chartData);
    } catch (err) {
      setError('Не удалось загрузить данные для графика');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Статистика по транзакциям
      </Typography>
      <Box sx={{ height: 400, width: '100%', mb: 4 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
            <XAxis 
              dataKey="month" 
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis 
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
              style={{ fontSize: '0.875rem' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff',
                border: '1px solid #ccc',
                borderRadius: 8
              }}
            />
            <Legend />
            <Line
              type="natural"
              dataKey="sum"
              name="Сумма транзакций"
              stroke="#4caf50"
              strokeWidth={3}
              dot={{ fill: '#4caf50', strokeWidth: 2, r: 4, opacity: showAnimation ? 1 : 0 }}
              activeDot={{ r: 6, fill: '#4caf50' }}
              strokeDasharray={showAnimation ? "none" : "2000 2000"}
              strokeDashoffset={showAnimation ? 0 : 2000}
              style={{ 
                transition: 'stroke-dashoffset 4.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: showAnimation ? 1 : 0,
                transform: `translateX(${showAnimation ? 0 : -10}px)`,
                transitionProperty: 'stroke-dashoffset, opacity, transform',
                transitionDelay: '0.2s'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Button variant="outlined" onClick={() => navigate('/transactions')} sx={{ mt: 2 }}>
        Вернуться к транзакциям
      </Button>
    </Container>
  );
}

export default PaymentStats; 