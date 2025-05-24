import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, MenuItem, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import SavingsIcon from '@mui/icons-material/Savings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTheme } from '@mui/material/styles';

function Deposits() {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDeposit, setNewDeposit] = useState({
    номерДепозитногоДоговора: '',
    название: '',
    типДепозита: '',
    суммаДепозита: '',
    валюта: 'RUB',
    процентнаяСтавка: '',
    процентНалога: '',
    датаОткрытия: new Date().toISOString().split('T')[0],
    датаЗакрытия: null,
    способВыплаты: '',
    минимальныйСрок: '',
    датаСледующейКапитализации: null,
    номерСчета: ''
  });
  const [addError, setAddError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState('');
  const theme = useTheme();

  const DEPOSIT_TYPES = ['Срочный', 'До востребования', 'Накопительный'];
  const CURRENCIES = ['RUB', 'USD', 'EUR', 'GBP', 'CNY', 'AED'];
  const PAYOUT_METHODS = ['Ежемесячно', 'Ежеквартально', 'В конце срока', 'Капитализация'];

  useEffect(() => {
    fetchDeposits();
    fetchAccounts();
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await bankService.getAccounts();
      const accountsData = response.data
        .filter(account => account.типСчета === 'Депозитный' || account.типСчета === 'Накопительный')
        .map(account => ({
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

  const fetchDeposits = async () => {
    try {
      const response = await bankService.getDeposits();
      setDeposits(response.data);
      console.log('Deposits from API:', response.data);
    } catch (err) {
      setError('Не удалось загрузить список вкладов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeposit = async () => {
    setAddError('');
    
    if (!newDeposit.номерДепозитногоДоговора || newDeposit.номерДепозитногоДоговора.length !== 20) {
      setAddError('Номер депозитного договора должен содержать 20 символов');
      return;
    }

    if (!newDeposit.название || newDeposit.название.length > 50) {
      setAddError('Название не может быть пустым и не должно превышать 50 символов');
      return;
    }

    if (!DEPOSIT_TYPES.includes(newDeposit.типДепозита)) {
      setAddError('Выберите корректный тип депозита');
      return;
    }

    if (!newDeposit.суммаДепозита || Number(newDeposit.суммаДепозита) <= 0) {
      setAddError('Сумма депозита должна быть положительным числом');
      return;
    }

    if (!CURRENCIES.includes(newDeposit.валюта)) {
      setAddError('Выберите корректную валюту');
      return;
    }

    const ставка = Number(newDeposit.процентнаяСтавка);
    if (isNaN(ставка) || ставка < 0.01 || ставка > 99.99) {
      setAddError('Процентная ставка должна быть от 0.01 до 99.99');
      return;
    }

    const налог = Number(newDeposit.процентНалога);
    if (isNaN(налог) || налог < 0.01 || налог > 99.99) {
      setAddError('Процент налога должен быть от 0.01 до 99.99');
      return;
    }

    if (!PAYOUT_METHODS.includes(newDeposit.способВыплаты)) {
      setAddError('Выберите корректный способ выплаты');
      return;
    }

    if (newDeposit.минимальныйСрок && Number(newDeposit.минимальныйСрок) <= 0) {
      setAddError('Минимальный срок должен быть положительным числом');
      return;
    }

    if (newDeposit.типДепозита === 'Срочный' && !newDeposit.датаЗакрытия) {
      setAddError('Для срочного депозита необходимо указать дату закрытия');
      return;
    }

    if (newDeposit.датаЗакрытия && new Date(newDeposit.датаЗакрытия) < new Date(newDeposit.датаОткрытия)) {
      setAddError('Дата закрытия не может быть раньше даты открытия');
      return;
    }

    try {
      await bankService.createDeposit(newDeposit);
      setAddDialogOpen(false);
      setNewDeposit({
        номерДепозитногоДоговора: '',
        название: '',
        типДепозита: '',
        суммаДепозита: '',
        валюта: 'RUB',
        процентнаяСтавка: '',
        процентНалога: '',
        датаОткрытия: new Date().toISOString().split('T')[0],
        датаЗакрытия: null,
        способВыплаты: '',
        минимальныйСрок: '',
        датаСледующейКапитализации: null,
        номерСчета: ''
      });
      fetchDeposits();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Ошибка при добавлении депозита');
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const response = await bankService.searchDeposits(value);
      setSearchResults(response.data);
    } catch (err) {
    } finally {
      setSearchLoading(false);
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
          <SavingsIcon sx={{ fontSize: 44, color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 900, letterSpacing: 1 }}>
            Вклады
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: 2, py: 1, px: 3 }} onClick={() => setAddDialogOpen(true)}>
            Добавить вклад
          </Button>
          <Button variant="outlined" color="primary" sx={{ fontWeight: 700, borderRadius: 2, py: 1, px: 3 }} onClick={() => navigate('/deposits/stats')}>
            Посмотреть статистику
          </Button>
        </Box>
      </Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Поиск по номеру договора"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          sx={{ minWidth: 320 }}
        />
        {searchLoading && <CircularProgress size={24} />}
      </Box>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {(searchTerm ? (searchResults ?? []) : deposits).map((deposit, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={deposit.номерДепозитногоДоговора} 
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
                <SavingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1, fontSize: 22 }}>
                  {deposit.типДепозита}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.2 }}>
                      Номер договора
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {deposit.номерДепозитногоДоговора}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.2 }}>
                      Сумма вклада
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {deposit.суммаДепозита} {deposit.валюта}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.2 }}>
                      Процентная ставка
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {deposit.процентнаяСтавка}%
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.2 }}>
                      Срок
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {deposit.минимальныйСрок ?? '—'} месяцев
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: deposit.депозитныйСчет?.статус === 'Активен' ? '#2ECC40' : deposit.депозитныйСчет?.статус === 'Закрыт' ? '#D32F2F' : '#FFD600', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {deposit.депозитныйСчет?.статус ?? '—'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ width: '100%', px: 3, pb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/deposits/${deposit.номерДепозитногоДоговора}`)}
                  fullWidth
                  sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, boxShadow: 'none', py: 1.1, background: 'linear-gradient(90deg, #003366 0%, #00539B 100%)', '&:hover': { background: 'linear-gradient(90deg, #00539B 0%, #003366 100%)' } }}
                  startIcon={<InfoOutlinedIcon />}
                >
                  Подробнее
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {searchTerm && searchResults && searchResults.length === 0 && !searchLoading && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Вклады не найдены
        </Typography>
      )}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Добавить новый депозит</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          <TextField
            fullWidth
            label="Номер депозитного договора"
            value={newDeposit.номерДепозитногоДоговора}
            onChange={e => setNewDeposit({ ...newDeposit, номерДепозитногоДоговора: e.target.value })}
            margin="normal"
            required
            error={newDeposit.номерДепозитногоДоговора && newDeposit.номерДепозитногоДоговора.length !== 20}
            helperText="20 символов"
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            fullWidth
            label="Название"
            value={newDeposit.название}
            onChange={e => setNewDeposit({ ...newDeposit, название: e.target.value })}
            margin="normal"
            required
            error={newDeposit.название && newDeposit.название.length > 50}
            helperText="До 50 символов"
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            select
            fullWidth
            label="Тип депозита"
            value={newDeposit.типДепозита}
            onChange={e => {
              const newType = e.target.value;
              setNewDeposit({ 
                ...newDeposit, 
                типДепозита: newType,
                датаЗакрытия: newType === 'Срочный' ? newDeposit.датаЗакрытия || null : null
              });
            }}
            margin="normal"
            required
          >
            {DEPOSIT_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth
            label="Сумма депозита"
            value={newDeposit.суммаДепозита}
            onChange={e => setNewDeposit({ ...newDeposit, суммаДепозита: e.target.value.replace(/[^0-9.]/g, '') })}
            margin="normal"
            required
            type="number"
            inputProps={{ min: 0.01, step: "0.01" }}
          />
          <TextField
            select
            fullWidth
            label="Валюта"
            value={newDeposit.валюта}
            onChange={e => setNewDeposit({ ...newDeposit, валюта: e.target.value })}
            margin="normal"
            required
          >
            {CURRENCIES.map(cur => <MenuItem key={cur} value={cur}>{cur}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth
            label="Процентная ставка"
            value={newDeposit.процентнаяСтавка}
            onChange={e => setNewDeposit({ ...newDeposit, процентнаяСтавка: e.target.value.replace(/[^0-9.]/g, '') })}
            margin="normal"
            required
            type="number"
            inputProps={{ min: 0.01, max: 99.99, step: "0.01" }}
            error={newDeposit.процентнаяСтавка && (Number(newDeposit.процентнаяСтавка) < 0.01 || Number(newDeposit.процентнаяСтавка) > 99.99)}
            helperText="От 0.01 до 99.99"
          />
          <TextField
            fullWidth
            label="Процент налога"
            value={newDeposit.процентНалога}
            onChange={e => setNewDeposit({ ...newDeposit, процентНалога: e.target.value.replace(/[^0-9.]/g, '') })}
            margin="normal"
            required
            type="number"
            inputProps={{ min: 0.01, max: 99.99, step: "0.01" }}
            error={newDeposit.процентНалога && (Number(newDeposit.процентНалога) < 0.01 || Number(newDeposit.процентНалога) > 99.99)}
            helperText="От 0.01 до 99.99"
          />
          <TextField
            fullWidth
            label="Дата открытия"
            type="date"
            value={newDeposit.датаОткрытия}
            onChange={e => setNewDeposit({ ...newDeposit, датаОткрытия: e.target.value })}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          {newDeposit.типДепозита === 'Срочный' && (
            <TextField
              fullWidth
              label="Дата закрытия"
              type="date"
              value={newDeposit.датаЗакрытия || ''}
              onChange={e => setNewDeposit({ ...newDeposit, датаЗакрытия: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: newDeposit.датаОткрытия }}
            />
          )}
          <TextField
            select
            fullWidth
            label="Способ выплаты"
            value={newDeposit.способВыплаты}
            onChange={e => setNewDeposit({ ...newDeposit, способВыплаты: e.target.value })}
            margin="normal"
            required
          >
            {PAYOUT_METHODS.map(method => <MenuItem key={method} value={method}>{method}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth
            label="Минимальный срок (месяцев)"
            value={newDeposit.минимальныйСрок}
            onChange={e => setNewDeposit({ ...newDeposit, минимальныйСрок: e.target.value.replace(/[^0-9]/g, '') })}
            margin="normal"
            type="number"
            inputProps={{ min: 1 }}
            helperText="Оставьте пустым или укажите положительное число"
          />
          <Autocomplete
            fullWidth
            options={accounts}
            loading={loadingAccounts}
            value={accounts.find(acc => acc.номерСчета === newDeposit.номерСчета) || null}
            onChange={(event, newValue) => {
              setNewDeposit({ 
                ...newDeposit, 
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddDeposit} variant="contained" color="primary">Добавить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Deposits; 