import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, MenuItem, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTheme } from '@mui/material/styles';

function Credits() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCredit, setNewCredit] = useState({
    номерДоговора: '',
    номерСчета: '',
    видКредита: '',
    сумма: '',
    датаВыдачи: new Date().toISOString().split('T')[0],
    датаЗакрытия: '',
    ставка: '',
    цельКредита: '',
    статус: 'В процессе оформления'
  });
  const [addError, setAddError] = useState('');
  const [creditTypes, setCreditTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState('');
  const STATUS_OPTIONS = ['Одобрен', 'Активен', 'Просрочен', 'Закрыт', 'Погашен досрочно', 'В процессе оформления'];
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchCredits();
    bankService.getCreditTypes().then(r => setCreditTypes(r.data)).catch(() => setCreditTypes([]));
    fetchAccounts();
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await bankService.getCredits();
      setCredits(response.data);
    } catch (err) {
      setError('Не удалось загрузить список кредитов');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await bankService.getAccounts();
            const accountsData = response.data        .filter(account => account.типСчета === 'Кредитный')        .map(account => ({
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

  const handleAddCredit = async () => {
    setAddError('');
    
    if (!newCredit.номерДоговора || !newCredit.номерДоговора.match(/^CR[0-9]{18}$/)) {
      setAddError('Номер договора должен быть в формате CR + 18 цифр (например, CR000000000000000001)');
      return;
    }

    if (!newCredit.номерСчета || newCredit.номерСчета.length !== 20) {
      setAddError('Номер счета должен содержать 20 символов');
      return;
    }

    if (!newCredit.видКредита) {
      setAddError('Выберите вид кредита');
      return;
    }

    if (!newCredit.сумма || Number(newCredit.сумма) <= 0) {
      setAddError('Сумма кредита должна быть положительным числом');
      return;
    }

    const minDate = new Date('2000-01-01');
    if (!newCredit.датаВыдачи || new Date(newCredit.датаВыдачи) < minDate) {
      setAddError('Дата выдачи не может быть раньше 01.01.2000');
      return;
    }

    if (newCredit.датаЗакрытия) {
      const issueDate = new Date(newCredit.датаВыдачи);
      const closeDate = new Date(newCredit.датаЗакрытия);
      const maxCloseDate = new Date(issueDate);
      maxCloseDate.setFullYear(maxCloseDate.getFullYear() + 30);

      if (closeDate < issueDate || closeDate > maxCloseDate) {
        setAddError('Дата закрытия должна быть не раньше даты выдачи и не позже 30 лет от даты выдачи');
        return;
      }
    }

    const ставка = Number(newCredit.ставка);
    if (isNaN(ставка) || ставка < 5.00 || ставка > 99.99) {
      setAddError('Процентная ставка должна быть от 5.00 до 99.99');
      return;
    }

    if (newCredit.цельКредита && (newCredit.цельКредита.length < 5 || newCredit.цельКредита.length > 255)) {
      setAddError('Цель кредита должна содержать от 5 до 255 символов');
      return;
    }

    try {
      const creditData = {
        ...newCredit,
        видКредита: Number(newCredit.видКредита),
        сумма: Number(newCredit.сумма)
      };

      await bankService.createCredit(creditData);
      setAddDialogOpen(false);
      setNewCredit({
        номерДоговора: '',
        номерСчета: '',
        видКредита: '',
        сумма: '',
        датаВыдачи: new Date().toISOString().split('T')[0],
        датаЗакрытия: '',
        ставка: '',
        цельКредита: '',
        статус: 'В процессе оформления'
      });
      fetchCredits();
    } catch (err) {
      console.error('Error creating credit:', err);
      setAddError(err.response?.data?.message || 'Ошибка при добавлении кредита');
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
      const response = await bankService.searchCredits(value);
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
          <AccountBalanceIcon sx={{ fontSize: 44, color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 900, letterSpacing: 1 }}>
            Кредиты
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: 2, py: 1, px: 3 }} onClick={() => setAddDialogOpen(true)}>
            Добавить кредит
          </Button>
          <Button variant="outlined" color="primary" sx={{ fontWeight: 700, borderRadius: 2, py: 1, px: 3 }} onClick={() => navigate('/credittypes')}>
            Создать вид кредита
          </Button>
        </Box>
      </Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Поиск по номеру кредита"
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
        {(searchTerm ? (searchResults ?? []) : credits).map((credit, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={credit.номерДоговора} 
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
                <AccountBalanceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1, fontSize: 22 }}>
                  Кредит №{credit.номерДоговора}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 17 }}>
                  Сумма кредита: {credit.сумма} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Процентная ставка: {credit.ставка}%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: credit.статус === 'Активен' ? '#2ECC40' : credit.статус === 'Закрыт' ? '#D32F2F' : '#FFD600', mr: 1 }} />
                  <span style={{ fontWeight: 600 }}>{credit.статус}</span>
                </Typography>
              </CardContent>
              <Box sx={{ width: '100%', px: 3, pb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/credits/${credit.номерДоговора}`)}
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
          Кредиты не найдены
        </Typography>
      )}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить новый кредит</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          <TextField
            fullWidth
            label="Номер договора"
            value={newCredit.номерДоговора}
            onChange={e => {
              const value = e.target.value.toUpperCase();
              if (value === '' || value.match(/^CR\d{0,18}$/)) {
                setNewCredit({ ...newCredit, номерДоговора: value });
              }
            }}
            margin="normal"
            required
            error={newCredit.номерДоговора && !newCredit.номерДоговора.match(/^CR[0-9]{18}$/)}
            helperText="Формат: CR + 18 цифр (например, CR000000000000000001)"
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            select
            fullWidth
            label="Вид кредита"
            value={newCredit.видКредита}
            onChange={e => setNewCredit({ ...newCredit, видКредита: e.target.value })}
            margin="normal"
            required
          >
            {creditTypes.map(type => (
              <MenuItem key={type.кодПродукта} value={type.кодПродукта}>
                {type.название}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            fullWidth
            options={accounts}
            loading={loadingAccounts}
            value={accounts.find(acc => acc.номерСчета === newCredit.номерСчета) || null}
            onChange={(event, newValue) => {
              setNewCredit({ 
                ...newCredit, 
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
            label="Сумма"
            value={newCredit.сумма}
            onChange={e => setNewCredit({ ...newCredit, сумма: e.target.value.replace(/[^0-9.]/g, '') })}
            margin="normal"
            required
            type="number"
            inputProps={{ min: 0.01, step: "0.01" }}
            helperText="Введите положительное число"
          />
          <TextField
            fullWidth
            label="Дата выдачи"
            type="date"
            value={newCredit.датаВыдачи}
            onChange={e => setNewCredit({ ...newCredit, датаВыдачи: e.target.value })}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: "2000-01-01" }}
            helperText="Не раньше 01.01.2000"
          />
          <TextField
            fullWidth
            label="Дата закрытия"
            type="date"
            value={newCredit.датаЗакрытия}
            onChange={e => setNewCredit({ ...newCredit, датаЗакрытия: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ 
              min: newCredit.датаВыдачи,
              max: newCredit.датаВыдачи ? new Date(new Date(newCredit.датаВыдачи).setFullYear(new Date(newCredit.датаВыдачи).getFullYear() + 30)).toISOString().split('T')[0] : undefined
            }}
            helperText="Опционально. Не раньше даты выдачи и не позже 30 лет"
          />
          <TextField
            fullWidth
            label="Ставка (%)"
            value={newCredit.ставка}
            onChange={e => setNewCredit({ ...newCredit, ставка: e.target.value.replace(/[^0-9.]/g, '') })}
            margin="normal"
            required
            type="number"
            inputProps={{ min: 5, max: 99.99, step: 0.01 }}
            error={newCredit.ставка && (Number(newCredit.ставка) < 5 || Number(newCredit.ставка) > 99.99)}
            helperText="От 5.00 до 99.99"
          />
          <TextField
            fullWidth
            label="Цель кредита"
            value={newCredit.цельКредита}
            onChange={e => setNewCredit({ ...newCredit, цельКредита: e.target.value })}
            margin="normal"
            multiline
            rows={2}
            inputProps={{ minLength: 5, maxLength: 255 }}
            error={newCredit.цельКредита && (newCredit.цельКредита.length < 5 || newCredit.цельКредита.length > 255)}
            helperText="От 5 до 255 символов (опционально)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddCredit} variant="contained" color="primary">Добавить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Credits; 