import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import { useTheme } from '@mui/material/styles';
function Cards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [newCard, setNewCard] = useState({
    номерКарты: '',
    типКарты: '',
    платежнаяСистема: '',
    срокДействия: '',
    лимит: '',
    статус: 'Активна',
    кодБезопасности: '',
    номерСчета: '',
    датаВыпускаГод: new Date().getFullYear().toString(),
    датаВыпускаМесяц: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    датаВыпускаДень: new Date().getDate().toString().padStart(2, '0'),
    датаВыпуска: new Date().toISOString().split('T')[0]
  });
  const [addError, setAddError] = useState('');
  const CARD_TYPES = ['Дебетовая', 'Кредитная', 'Виртуальная', 'Предоплаченная'];
  const PAYMENT_SYSTEMS = ['Visa', 'MasterCard', 'Mir', 'UnionPay'];
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('номерКарты');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchCards();
    fetchAccounts();
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchCards = async () => {
    try {
      const response = await bankService.getCards();
      setCards(response.data);
    } catch (err) {
      setError('Не удалось загрузить список карт');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await bankService.getAccounts();
            const accountsData = response.data        .filter(account => account.типСчета === 'Карточный')        .map(account => ({
          id: account.id || account.номерСчета,
          номерСчета: account.номерСчета,
          типСчета: account.типСчета,
          статус: account.статус
        }));
      setAccounts(accountsData);
    } catch (err) {
      setAccountError('Не удалось загрузить список счетов');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAddCard = async () => {
    setAddError('');
    
    if (!newCard.номерКарты || newCard.номерКарты.length !== 16) {
      setAddError('Номер карты должен содержать 16 цифр');
      return;
    }

    if (!newCard.срокДействия || !/^(0[1-9]|1[0-2])\/([2-9][0-9])$/.test(newCard.срокДействия)) {
      setAddError('Неверный формат срока действия (MM/YY)');
      return;
    }

    const [month, year] = newCard.срокДействия.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    const expiryDate = new Date(2000 + expYear, expMonth - 1, 1);
    const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    if (expiryDate < firstDayOfCurrentMonth) {
      setAddError('Срок действия карты не может быть в прошлом');
      return;
    }

    if (!CARD_TYPES.includes(newCard.типКарты)) {
      setAddError('Выберите корректный тип карты');
      return;
    }

    if (!PAYMENT_SYSTEMS.includes(newCard.платежнаяСистема)) {
      setAddError('Выберите корректную платежную систему');
      return;
    }

    if (!newCard.датаВыпуска) {
      setAddError('Укажите дату выпуска карты');
      return;
    }

    const issueDate = new Date(newCard.датаВыпуска);
    if (issueDate > new Date()) {
      setAddError('Дата выпуска не может быть в будущем');
      return;
    }

    if (!newCard.кодБезопасности || !/^[0-9]{3}$/.test(newCard.кодБезопасности)) {
      setAddError('Код безопасности должен содержать 3 цифры');
      return;
    }

    if (newCard.лимит && Number(newCard.лимит) < 0) {
      setAddError('Лимит не может быть отрицательным');
      return;
    }

    try {
      await bankService.createCard({
        номерКарты: newCard.номерКарты,
        срокДействия: newCard.срокДействия,
        типКарты: newCard.типКарты,
        платежнаяСистема: newCard.платежнаяСистема,
        датаВыпуска: newCard.датаВыпуска,
        кодБезопасности: newCard.кодБезопасности,
        лимит: newCard.лимит ? Number(newCard.лимит) : null,
        номерСчета: newCard.номерСчета,
        статус: 'Активна'
      });
      setAddDialogOpen(false);
      setNewCard({
        номерКарты: '',
        типКарты: '',
        платежнаяСистема: '',
        срокДействия: '',
        лимит: '',
        статус: 'Активна',
        кодБезопасности: '',
        номерСчета: '',
        датаВыпуска: new Date().toISOString().split('T')[0]
      });
      fetchCards();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Ошибка при добавлении карты');
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
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: 2,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.5s ease-out'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CreditCardIcon sx={{ fontSize: 44, color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 900, letterSpacing: 1 }}>
            Банковские карты
          </Typography>
        </Box>
        <TextField
          label="Поиск по карте, типу, системе"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 260, mr: 2 }}
        />
        <TextField
          select
          label="Сортировка"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          size="small"
          sx={{ minWidth: 180, mr: 2 }}
        >
          <MenuItem value="номерКарты">Номер карты</MenuItem>
          <MenuItem value="типКарты">Тип карты</MenuItem>
          <MenuItem value="платежнаяСистема">Платежная система</MenuItem>
          <MenuItem value="статус">Статус</MenuItem>
        </TextField>
        <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} sx={{ minWidth: 44, fontWeight: 700 }}>{sortOrder === 'asc' ? '↑' : '↓'}</Button>
        <Button variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: 2, py: 1, px: 3 }} onClick={() => setAddDialogOpen(true)}>
          Добавить карту
        </Button>
      </Box>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {cards
          .filter(card => {
            const q = search.trim().toLowerCase();
            return (
              card.номерКарты?.toLowerCase().includes(q) ||
              card.типКарты?.toLowerCase().includes(q) ||
              card.платежнаяСистема?.toLowerCase().includes(q) ||
              card.номерСчета?.toLowerCase().includes(q)
            );
          })
          .sort((a, b) => {
            let aValue = a[sortBy] || '';
            let bValue = b[sortBy] || '';
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            return 0;
          })
          .map((card, index) => {
            const statusColor = card.статус === 'Активна' ? '#2ECC40' : '#D32F2F';
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={card.номерКарты} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'stretch',
                  opacity: showContent ? 1 : 0,
                  transform: showContent ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease-out ${index * 0.1}s`
                }}
              >
                <Card sx={{
                  minHeight: 260,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  borderRadius: 5,
                  boxShadow: '0 4px 24px 0 rgba(0,51,102,0.13)',
                  background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff',
                  transition: 'box-shadow 0.18s, transform 0.18s',
                  '&:hover': {
                    boxShadow: '0 12px 36px 0 rgba(0,51,102,0.18)',
                    transform: 'translateY(-4px) scale(1.03)'
                  },
                  p: 0
                }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', width: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
                    <CreditCardIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1, fontSize: 22 }}>
                      {card.типКарты}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 17 }}>
                      Номер карты: <span style={{ letterSpacing: 2, fontWeight: 600 }}>{card.номерКарты}</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                      Платёжная система: {card.платежнаяСистема || '—'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {card.статус}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ width: '100%', px: 3, pb: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/cards/${card.номерКарты}`)}
                      fullWidth
                      sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, boxShadow: 'none', py: 1.1, background: 'linear-gradient(90deg, #003366 0%, #00539B 100%)', '&:hover': { background: 'linear-gradient(90deg, #00539B 0%, #003366 100%)' } }}
                      startIcon={<InfoOutlinedIcon />}
                    >
                      Подробнее
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
      </Grid>
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Добавить новую карту</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          <Autocomplete
            fullWidth
            options={accounts}
            loading={loadingAccounts}
            value={accounts.find(acc => acc.номерСчета === newCard.номерСчета) || null}
            onChange={(event, newValue) => {
              setNewCard({ 
                ...newCard, 
                номерСчета: newValue ? newValue.номерСчета : '' 
              });
            }}
            getOptionLabel={(option) => option.номерСчета}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body1">{option.номерСчета}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.типСчета} - {option.статус}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Номер счета"
                required
                margin="normal"
                error={!!accountError}
                helperText={accountError || "Введите номер счета или выберите из списка"}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loadingAccounts ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          <TextField
            fullWidth
            label="Номер карты"
            value={newCard.номерКарты}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 16);
              setNewCard({ ...newCard, номерКарты: value });
            }}
            margin="normal"
            required
            error={newCard.номерКарты && newCard.номерКарты.length !== 16}
            helperText="16 цифр"
            inputProps={{ maxLength: 16 }}
          />
          <TextField
            fullWidth
            label="Срок действия"
            value={newCard.срокДействия}
            onChange={e => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 0) {
                if (value.length >= 1) {
                  const month = parseInt(value[0]);
                  if (month > 1) {
                    value = '0' + value[0];
                  }
                }
                if (value.length >= 2) {
                  const month = parseInt(value.substring(0, 2));
                  if (month > 12) {
                    value = '12' + value.substring(2);
                  }
                }
                if (value.length >= 2) {
                  value = value.substring(0, 2) + '/' + value.substring(2);
                }
                if (value.length > 5) {
                  value = value.substring(0, 5);
                }
              }
              setNewCard({ ...newCard, срокДействия: value });
            }}
            margin="normal"
            required
            error={newCard.срокДействия && !/^(0[1-9]|1[0-2])\/([2-9][0-9])$/.test(newCard.срокДействия)}
            helperText="Формат: MM/YY (например, 12/25)"
            inputProps={{ maxLength: 5 }}
          />
          <TextField
            select
            fullWidth
            label="Тип карты"
            value={newCard.типКарты}
            onChange={e => setNewCard({ ...newCard, типКарты: e.target.value })}
            margin="normal"
            required
          >
            {CARD_TYPES.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Платежная система"
            value={newCard.платежнаяСистема}
            onChange={e => setNewCard({ ...newCard, платежнаяСистема: e.target.value })}
            margin="normal"
            required
          >
            {PAYMENT_SYSTEMS.map(system => (
              <MenuItem key={system} value={system}>{system}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Дата выпуска"
            type="date"
            value={newCard.датаВыпуска}
            onChange={e => setNewCard({ ...newCard, датаВыпуска: e.target.value })}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
          />
          <TextField
            fullWidth
            label="Код безопасности (CVV)"
            value={newCard.кодБезопасности}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
              setNewCard({ ...newCard, кодБезопасности: value });
            }}
            margin="normal"
            required
            error={newCard.кодБезопасности && !/^[0-9]{3}$/.test(newCard.кодБезопасности)}
            helperText="3 цифры"
            inputProps={{ maxLength: 3 }}
            type="password"
          />
          <TextField
            fullWidth
            label="Лимит"
            value={newCard.лимит}
            onChange={e => {
              const value = e.target.value.replace(/[^0-9.]/g, '');
              setNewCard({ ...newCard, лимит: value });
            }}
            margin="normal"
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            helperText="Оставьте пустым или укажите положительное число"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddCard} variant="contained" color="primary">Добавить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Cards; 