import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, MenuItem, Autocomplete } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function CreditDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editedCredit, setEditedCredit] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [creditTypes, setCreditTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState('');
  const STATUS_OPTIONS = ['Одобрен', 'Активен', 'Просрочен', 'Закрыт', 'Погашен досрочно', 'В процессе оформления'];

  useEffect(() => {
    fetchCredit();
    bankService.getCreditTypes().then(r => setCreditTypes(r.data)).catch(() => setCreditTypes([]));
    fetchAccounts();
  }, [id]);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await bankService.getAccounts();
      const accountsData = response.data
        .filter(account => account.типСчета === 'Депозитный')
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

  const fetchCredit = async () => {
    try {
      const response = await bankService.getCredit(id);
      setCredit(response.data);
      setEditedCredit(response.data);
    } catch (err) {
      setError('Не удалось загрузить информацию о кредите');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      await bankService.approveCredit(id);
      setSuccessMessage('Кредит успешно одобрен');
      fetchCredit();
    } catch (err) {
      setError('Не удалось одобрить кредит');
    }
  };

  const handleReject = async () => {
    try {
      await bankService.rejectCredit(id);
      setSuccessMessage('Кредит отклонен');
      fetchCredit();
    } catch (err) {
      setError('Не удалось отклонить кредит');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await bankService.updateCredit(id, editedCredit);
      setSuccessMessage('Информация о кредите успешно обновлена');
      setEditDialogOpen(false);
      fetchCredit();
    } catch (err) {
      setError('Не удалось обновить информацию о кредите');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await bankService.deleteCredit(id);
      setDeleteDialogOpen(false);
      navigate('/credits');
    } catch (err) {
      setError('Не удалось удалить кредит');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Кредит №{credit.номерДоговора}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
            {credit.статус === 'На рассмотрении' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApprove}
                >
                  Одобрить
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleReject}
                >
                  Отклонить
                </Button>
              </>
            )}
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Номер договора</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.номерДоговора}</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Вид кредита (ID)</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.видКредита}</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Номер счета</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.номерСчета}</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Сумма</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.сумма} ₽</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Ставка</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.ставка}%</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Статус</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.статус}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Дата выдачи</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.датаВыдачи ? new Date(credit.датаВыдачи).toLocaleDateString() : '—'}</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Дата закрытия</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.датаЗакрытия ? new Date(credit.датаЗакрытия).toLocaleDateString() : 'Не закрыт'}</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Цель кредита</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{credit.цельКредита}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/credits')}
          >
            Назад к списку
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/transactions')}
          >
            История платежей
          </Button>
        </Box>
      </Paper>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Редактировать кредит</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Номер договора"
            value={editedCredit?.номерДоговора || ''}
            onChange={e => setEditedCredit({ ...editedCredit, номерДоговора: e.target.value.replace(/[^0-9]/g, '').slice(0, 18).padStart(18, '0').replace(/^/, 'CR') })}
            margin="normal"
            required
            helperText="Формат: CR + 18 цифр (например, CR000000000000000001)"
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            select
            fullWidth
            label="Вид кредита"
            value={editedCredit?.видКредита || ''}
            onChange={e => setEditedCredit({ ...editedCredit, видКредита: e.target.value })}
            margin="normal"
            required
            helperText="Выберите вид кредита"
          >
            {creditTypes.map((type, idx) => <MenuItem key={type.кодПродукта || idx} value={type.кодПродукта}>{type.название}</MenuItem>)}
          </TextField>
          <Autocomplete
            fullWidth
            options={accounts}
            loading={loadingAccounts}
            value={accounts.find(acc => acc.номерСчета === editedCredit?.номерСчета) || null}
            onChange={(event, newValue) => {
              setEditedCredit({ 
                ...editedCredit, 
                номерСчета: newValue ? newValue.номерСчета : '' 
              });
            }}
            getOptionLabel={(option) => {
              return option.номерСчета;
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
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
            value={editedCredit?.сумма || ''}
            onChange={e => setEditedCredit({ ...editedCredit, сумма: e.target.value.replace(/[^0-9.]/g, '') })}
            margin="normal"
            required
            helperText="Только положительное число"
            type="number"
          />
          <TextField
            fullWidth
            label="Дата выдачи"
            type="date"
            value={editedCredit?.датаВыдачи || ''}
            onChange={e => setEditedCredit({ ...editedCredit, датаВыдачи: e.target.value })}
            margin="normal"
            required
            helperText="Не раньше 01.01.2000"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Дата закрытия (опционально)"
            type="date"
            value={editedCredit?.датаЗакрытия || ''}
            onChange={e => setEditedCredit({ ...editedCredit, датаЗакрытия: e.target.value })}
            margin="normal"
            helperText="Не раньше даты выдачи, не позже чем через 30 лет"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Ставка (%)"
            value={editedCredit?.ставка || ''}
            onChange={e => setEditedCredit({ ...editedCredit, ставка: e.target.value.replace(/[^0-9.]/g, '') })}
            margin="normal"
            required
            helperText="от 5.00 до 99.99"
            type="number"
            inputProps={{ min: 5, max: 99.99, step: 0.01 }}
          />
          <TextField
            fullWidth
            label="Цель кредита (опционально)"
            value={editedCredit?.цельКредита || ''}
            onChange={e => setEditedCredit({ ...editedCredit, цельКредита: e.target.value })}
            margin="normal"
            helperText="от 5 до 255 символов (опционально)"
            inputProps={{ minLength: 5, maxLength: 255 }}
          />
          <TextField
            select
            fullWidth
            label="Статус"
            value={editedCredit?.статус || ''}
            onChange={e => setEditedCredit({ ...editedCredit, статус: e.target.value })}
            margin="normal"
            required
            helperText="Выберите статус кредита"
          >
            {STATUS_OPTIONS.map((status, idx) => <MenuItem key={status + '-' + idx} value={status}>{status}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveEdit} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот кредит? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CreditDetails; 