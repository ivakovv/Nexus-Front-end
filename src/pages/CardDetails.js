import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, MenuItem, Autocomplete } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';

function CardDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editedCard, setEditedCard] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [account, setAccount] = useState(null);
  const [client, setClient] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [showContent, setShowContent] = useState(false);

  const CARD_TYPES = ['Дебетовая', 'Кредитная', 'Виртуальная', 'Предоплаченная'];
  const PAYMENT_SYSTEMS = ['Visa', 'MasterCard', 'Mir', 'UnionPay'];

  useEffect(() => {
    fetchCard();
    fetchAccounts();
  }, [id]);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await bankService.getAccounts();
      const accountsData = (response.data || [])
        .filter(account => account && account.типСчета === 'Карточный')
        .map(account => ({
          id: account.id || account.номерСчета,
          номерСчета: account.номерСчета,
          типСчета: account.типСчета,
          статус: account.статус
        }))
        .filter(account => account.номерСчета);
      setAccounts(accountsData);
    } catch (err) {
      setAccountError('Не удалось загрузить список счетов');
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchCard = async () => {
    try {
      const response = await bankService.getCard(id);
      setCard(response.data);
      setEditedCard(response.data);
      fetchAccount(response.data.номерСчета);
    } catch (err) {
      setError('Не удалось загрузить информацию о карте');
    } finally {
      setLoading(false);
      setShowContent(true);
    }
  };

  const fetchAccount = async (accountNumber) => {
    try {
      const accountRes = await bankService.getAccount(accountNumber);
      setAccount(accountRes.data);

      const clientAccountRes = await bankService.getClientAccountByAccount(accountNumber);
      const clientId = clientAccountRes.data?.idКлиента || clientAccountRes.data?.clientId || clientAccountRes.data?.клиентId;
      if (clientId) {
        const clientRes = await bankService.getClient(clientId);
        setClient(clientRes.data);
      } else {
        setClient(null);
      }
    } catch (err) {
      setAccount(null);
      setClient(null);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleBlock = async () => {
    try {
      await bankService.blockCard(id);
      setSuccessMessage('Карта успешно заблокирована');
      fetchCard();
    } catch (err) {
      setError('Не удалось заблокировать карту');
    }
  };

  const handleUnblock = async () => {
    try {
      await bankService.unblockCard(id);
      setSuccessMessage('Карта успешно разблокирована');
      fetchCard();
    } catch (err) {
      setError('Не удалось разблокировать карту');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = {
        лимит: editedCard.лимит ? Number(editedCard.лимит) : null,
        платежнаяСистема: editedCard.платежнаяСистема,
        срокДействия: editedCard.срокДействия,
        типКарты: editedCard.типКарты,
        статус: editedCard.статус
      };

      await bankService.updateCard(id, updateData);
      setSuccessMessage('Информация о карте успешно обновлена');
      setEditDialogOpen(false);
      fetchCard();
    } catch (err) {
      setError('Не удалось обновить информацию о карте');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await bankService.deleteCard(id);
      setDeleteDialogOpen(false);
      navigate('/cards');
    } catch (err) {
      setError('Не удалось удалить карту');
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
          <CreditCardIcon sx={{ 
            fontSize: 44, 
            mr: 2, 
            color: 'primary.main',
            animation: 'pulse 2s infinite'
          }} />
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            letterSpacing: 1
          }}>
            {card.типКарты}
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
          {card.статус === 'Активна' ? (
            <Button
              variant="contained"
              color="warning"
              startIcon={<BlockIcon />}
              onClick={handleBlock}
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
              Заблокировать
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<LockOpenIcon />}
              onClick={handleUnblock}
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
              Разблокировать
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
            <Typography variant="subtitle2" color="text.secondary">Номер карты</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{card.номерКарты}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Дата выпуска</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{card.датаВыпуска ? new Date(card.датаВыпуска).toLocaleDateString() : '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Лимит</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{card.лимит ? `${card.лимит} ₽` : '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Срок действия</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{card.срокДействия}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Статус</Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 600, 
              color: card.статус === 'Активна' ? 'green' : 'red',
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
            }}>{card.статус || '—'}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Платежная система</Typography>
            <Typography variant="body1" sx={{ 
              color: 'primary.main', 
              fontWeight: 500,
              mb: 2
            }}>{card.платежнаяСистема}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Номер счета</Typography>
            <Typography variant="body1" sx={{ 
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              mb: 2
            }}>{card.номерСчета}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Тип карты</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>{card.типКарты}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-start'
        }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/cards')}
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
        <DialogTitle>Редактировать карту</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
            <TextField
              label="Номер карты"
              value={editedCard?.номерКарты || ''}
              disabled
              helperText="Номер карты нельзя изменить"
              fullWidth
            />
            <TextField
              label="Дата выпуска"
              value={editedCard?.датаВыпуска || ''}
              disabled
              helperText="Дата выпуска нельзя изменить"
              fullWidth
            />
            <TextField
              label="Код безопасности"
              value={editedCard?.кодБезопасности || ''}
              disabled
              helperText="Код безопасности нельзя изменить"
              fullWidth
            />
            <TextField
              label="Номер счета"
              value={editedCard?.номерСчета || ''}
              disabled
              helperText="Номер счета нельзя изменить"
              fullWidth
            />
            <TextField
              label="Лимит"
              type="number"
              value={editedCard?.лимит || ''}
              onChange={(e) => setEditedCard({ ...editedCard, лимит: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Платежная система"
              value={editedCard?.платежнаяСистема || ''}
              onChange={(e) => setEditedCard({ ...editedCard, платежнаяСистема: e.target.value })}
              fullWidth
            >
              {PAYMENT_SYSTEMS.map((system) => (
                <MenuItem key={system} value={system}>
                  {system}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Срок действия"
              value={editedCard?.срокДействия || ''}
              onChange={(e) => setEditedCard({ ...editedCard, срокДействия: e.target.value })}
              placeholder="MM/YY"
              fullWidth
            />
            <TextField
              select
              label="Тип карты"
              value={editedCard?.типКарты || ''}
              onChange={(e) => setEditedCard({ ...editedCard, типКарты: e.target.value })}
              fullWidth
            >
              {CARD_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Статус"
              value={editedCard?.статус || ''}
              onChange={(e) => setEditedCard({ ...editedCard, статус: e.target.value })}
              fullWidth
            >
              <MenuItem value="Активна">Активна</MenuItem>
              <MenuItem value="Заблокирована">Заблокирована</MenuItem>
              <MenuItem value="Заморожена">Заморожена</MenuItem>
              <MenuItem value="Аннулирована">Аннулирована</MenuItem>
              <MenuItem value="Утеряна">Утеряна</MenuItem>
            </TextField>
          </Box>
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
            Вы уверены, что хотите удалить эту карту? Это действие нельзя отменить.
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

export default CardDetails; 