import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import SavingsIcon from '@mui/icons-material/Savings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import LockOpenIcon from '@mui/icons-material/LockOpen';

function DepositDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editedDeposit, setEditedDeposit] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showContent, setShowContent] = useState(false);

  const DEPOSIT_TYPES = ['Срочный', 'До востребования', 'Накопительный'];
  const CURRENCIES = ['RUB', 'USD', 'EUR', 'GBP', 'CNY', 'AED'];
  const PAYOUT_METHODS = ['Ежемесячно', 'Ежеквартально', 'В конце срока', 'Капитализация'];

  useEffect(() => {
    fetchDeposit();
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [id]);

  const fetchDeposit = async () => {
    try {
      const response = await bankService.getDeposit(id);
      setDeposit(response.data);
      setEditedDeposit(response.data);
    } catch (err) {
      setError('Не удалось загрузить информацию о вкладе');
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

  const handleClose = async () => {
    try {
      await bankService.closeDeposit(id);
      setSuccessMessage('Вклад успешно закрыт');
      fetchDeposit();
    } catch (err) {
      setError('Не удалось закрыть вклад');
    }
  };

  const validateEditedDeposit = () => {
    if (!editedDeposit.название || editedDeposit.название.length > 50) {
      return 'Название не может быть пустым и не должно превышать 50 символов';
    }

    if (!DEPOSIT_TYPES.includes(editedDeposit.типДепозита)) {
      return 'Выберите корректный тип вклада';
    }

    if (!editedDeposit.суммаДепозита || Number(editedDeposit.суммаДепозита) <= 0) {
      return 'Сумма вклада должна быть положительным числом';
    }

    if (!CURRENCIES.includes(editedDeposit.валюта)) {
      return 'Выберите корректную валюту';
    }

    const ставка = Number(editedDeposit.процентнаяСтавка);
    if (isNaN(ставка) || ставка < 0.01 || ставка > 99.99) {
      return 'Процентная ставка должна быть от 0.01 до 99.99';
    }

    const налог = Number(editedDeposit.процентНалога);
    if (isNaN(налог) || налог < 0.01 || налог > 99.99) {
      return 'Процент налога должен быть от 0.01 до 99.99';
    }

    if (!PAYOUT_METHODS.includes(editedDeposit.способВыплаты)) {
      return 'Выберите корректный способ выплаты';
    }

    return null;
  };

  const handleSaveEdit = async () => {
    const validationError = validateEditedDeposit();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const updateData = {
        название: editedDeposit.название,
        типДепозита: editedDeposit.типДепозита,
        суммаДепозита: Number(editedDeposit.суммаДепозита),
        валюта: editedDeposit.валюта,
        процентнаяСтавка: Number(editedDeposit.процентнаяСтавка),
        процентНалога: Number(editedDeposit.процентНалога),
        способВыплаты: editedDeposit.способВыплаты,
        минимальныйСрок: editedDeposit.минимальныйСрок ? Number(editedDeposit.минимальныйСрок) : null,
        датаЗакрытия: editedDeposit.датаЗакрытия,
        статус: editedDeposit.депозитныйСчет?.статус
      };

      await bankService.updateDeposit(id, updateData);
      setSuccessMessage('Информация о вкладе успешно обновлена');
      setEditDialogOpen(false);
      fetchDeposit();
    } catch (err) {
      setError('Не удалось обновить информацию о вкладе');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await bankService.deleteDeposit(id);
      setDeleteDialogOpen(false);
      navigate('/deposits');
    } catch (err) {
      setError('Не удалось удалить вклад');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            animation: 'slideDown 0.5s ease-out',
            '@keyframes slideDown': {
              from: { 
                opacity: 0,
                transform: 'translateY(-20px)'
              },
              to: { 
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            animation: 'shake 0.5s ease-in-out',
            '@keyframes shake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
              '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
            }
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      <Paper elevation={3} sx={{ 
        p: 4, 
        maxWidth: 800, 
        margin: '0 auto', 
        borderRadius: 4, 
        boxShadow: '0 4px 24px 0 rgba(0,51,102,0.13)',
        transform: showContent ? 
          'perspective(1000px) translateY(0) scale(1)' : 
          'perspective(1000px) translateY(50px) scale(0.9)',
        opacity: showContent ? 1 : 0,
        transition: 'all 1.5s cubic-bezier(0.23, 1, 0.32, 1)',
        transformOrigin: 'center',
        '&:hover': {
          transform: 'perspective(1000px) translateY(-5px) scale(1.01)',
          boxShadow: '0 12px 36px 0 rgba(0,51,102,0.18)',
          transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 3
        }}>
          <SavingsIcon sx={{ 
            fontSize: 44, 
            mr: 2, 
            color: 'primary.main',
            animation: 'pulse 2s infinite'
          }} />
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            letterSpacing: 1
          }}>
            {deposit.название}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'nowrap',
          mb: 4,
          width: '100%',
          overflowX: { xs: 'auto', sm: 'visible' },
          pb: { xs: 1, sm: 0 },
          '&::-webkit-scrollbar': {
            height: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '2px'
          }
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ 
              minWidth: '130px',
              whiteSpace: 'nowrap',
              px: 2,
              py: 1,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            Редактировать
          </Button>
          {deposit.депозитныйСчет?.статус === 'Активен' ? (
            <Button
              variant="contained"
              color="warning"
              startIcon={<CloseIcon />}
              onClick={handleClose}
              sx={{ 
                minWidth: '130px',
                whiteSpace: 'nowrap',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Закрыть вклад
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<LockOpenIcon />}
              onClick={handleClose}
              sx={{ 
                minWidth: '130px',
                whiteSpace: 'nowrap',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Возобновить
            </Button>
          )}
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{ 
              minWidth: '130px',
              whiteSpace: 'nowrap',
              px: 2,
              py: 1,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            Удалить
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Номер договора</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{deposit.номерДепозитногоДоговора}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Название</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.название}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Тип вклада</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.типДепозита}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Сумма вклада</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.суммаДепозита} {deposit.валюта}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Процентная ставка</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.процентнаяСтавка}%</Typography>

            <Typography variant="subtitle2" color="text.secondary">Процент налога</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.процентНалога}%</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Статус</Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 600, 
              color: deposit.депозитныйСчет?.статус === 'Активен' ? 'green' : 'red',
              display: 'inline-flex',
              alignItems: 'center',
              mb: 2,
              '&::before': {
                content: '""',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'currentColor',
                marginRight: '8px'
              }
            }}>{deposit.депозитныйСчет?.статус || '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Дата открытия</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.датаОткрытия ? new Date(deposit.датаОткрытия).toLocaleDateString() : '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Дата закрытия</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.датаЗакрытия ? new Date(deposit.датаЗакрытия).toLocaleDateString() : 'Не закрыт'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Способ выплаты</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.способВыплаты}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Минимальный срок</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.минимальныйСрок ? `${deposit.минимальныйСрок} месяцев` : '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Дата следующей капитализации</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{deposit.датаСледующейКапитализации ? new Date(deposit.датаСледующейКапитализации).toLocaleDateString() : '—'}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/deposits')}
            sx={{ 
              minWidth: '180px',
              height: 40,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            Назад к списку
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/transactions')}
            sx={{ 
              minWidth: '180px',
              height: 40,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            История операций
          </Button>
        </Box>
      </Paper>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Редактировать вклад</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, mt: 2 }}>
            <TextField
              label="Номер договора"
              value={editedDeposit?.номерДепозитногоДоговора || ''}
              disabled
              helperText="Номер договора нельзя изменить"
              fullWidth
            />
            <TextField
              label="Дата открытия"
              value={editedDeposit?.датаОткрытия ? new Date(editedDeposit.датаОткрытия).toLocaleDateString() : ''}
              disabled
              helperText="Дата открытия нельзя изменить"
              fullWidth
            />
            <TextField
              label="Название"
              value={editedDeposit?.название || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, название: e.target.value })}
              fullWidth
              required
              error={editedDeposit?.название && editedDeposit.название.length > 50}
              helperText="До 50 символов"
            />
            <TextField
              select
              label="Тип вклада"
              value={editedDeposit?.типДепозита || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, типДепозита: e.target.value })}
              fullWidth
              required
            >
              {DEPOSIT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Сумма вклада"
              type="number"
              value={editedDeposit?.суммаДепозита || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, суммаДепозита: e.target.value })}
              fullWidth
              required
              inputProps={{ min: "0.01", step: "0.01" }}
            />
            <TextField
              select
              label="Валюта"
              value={editedDeposit?.валюта || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, валюта: e.target.value })}
              fullWidth
              required
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>{currency}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Процентная ставка"
              type="number"
              value={editedDeposit?.процентнаяСтавка || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, процентнаяСтавка: e.target.value })}
              fullWidth
              required
              inputProps={{ min: "0.01", max: "99.99", step: "0.01" }}
              helperText="От 0.01 до 99.99"
            />
            <TextField
              label="Процент налога"
              type="number"
              value={editedDeposit?.процентНалога || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, процентНалога: e.target.value })}
              fullWidth
              required
              inputProps={{ min: "0.01", max: "99.99", step: "0.01" }}
              helperText="От 0.01 до 99.99"
            />
            <TextField
              select
              label="Способ выплаты"
              value={editedDeposit?.способВыплаты || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, способВыплаты: e.target.value })}
              fullWidth
              required
            >
              {PAYOUT_METHODS.map((method) => (
                <MenuItem key={method} value={method}>{method}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Минимальный срок (месяцев)"
              type="number"
              value={editedDeposit?.минимальныйСрок || ''}
              onChange={(e) => setEditedDeposit({ ...editedDeposit, минимальныйСрок: e.target.value })}
              fullWidth
              inputProps={{ min: "1" }}
              helperText="Оставьте пустым или укажите положительное число"
            />
            {editedDeposit?.типДепозита === 'Срочный' && (
              <TextField
                label="Дата закрытия"
                type="date"
                value={editedDeposit?.датаЗакрытия?.split('T')[0] || ''}
                onChange={(e) => setEditedDeposit({ ...editedDeposit, датаЗакрытия: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: editedDeposit?.датаОткрытия?.split('T')[0] }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот вклад? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DepositDetails; 