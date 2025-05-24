import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../services/api';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

function CreditTypes() {
  const navigate = useNavigate();
  const [creditTypes, setCreditTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();

  const CREDIT_CATEGORIES = ['Потребительский', 'Ипотека', 'Автокредит', 'Бизнес'];

  const [newType, setNewType] = useState({
    название: '',
    категория: '',
    минимальнаяСумма: '',
    максимальнаяСумма: '',
    минимальныйСрок: '',
    максимальныйСрок: '',
    базоваяСтавка: '',
    необходимоСтрахование: false,
    активный: true,
    описание: ''
  });

  const validateCreditType = (type) => {
    if (type.название.length < 5 || type.название.length > 100) {
      throw new Error('Название должно быть от 5 до 100 символов');
    }
    if (!CREDIT_CATEGORIES.includes(type.категория)) {
      throw new Error('Выберите корректную категорию кредита');
    }
    if (type.минимальныйСрок < 1 || type.минимальныйСрок > 120) {
      throw new Error('Минимальный срок должен быть от 1 до 120 месяцев');
    }
    if (type.максимальныйСрок < 1 || type.максимальныйСрок > 360) {
      throw new Error('Максимальный срок должен быть от 1 до 360 месяцев');
    }
    if (Number(type.максимальныйСрок) < Number(type.минимальныйСрок)) {
      throw new Error('Максимальный срок должен быть больше минимального');
    }
    if (type.базоваяСтавка < 0.01 || type.базоваяСтавка > 99.99) {
      throw new Error('Базовая ставка должна быть от 0.01% до 99.99%');
    }
    if (type.минимальнаяСумма && type.максимальнаяСумма) {
      if (Number(type.максимальнаяСумма) < Number(type.минимальнаяСумма)) {
        throw new Error('Максимальная сумма должна быть больше минимальной');
      }
      if (Number(type.максимальнаяСумма) / Number(type.минимальнаяСумма) > 100) {
        throw new Error('Отношение максимальной суммы к минимальной не должно превышать 100');
      }
    }
  };

  useEffect(() => {
    fetchCreditTypes();
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchCreditTypes = async () => {
    try {
      const response = await bankService.getCreditTypes();
      setCreditTypes(response.data);
    } catch (err) {
      setError('Не удалось загрузить список видов кредитов');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      validateCreditType(newType);
      await bankService.createCreditType({
        ...newType,
        минимальнаяСумма: newType.минимальнаяСумма ? Number(newType.минимальнаяСумма) : null,
        максимальнаяСумма: newType.максимальнаяСумма ? Number(newType.максимальнаяСумма) : null,
        минимальныйСрок: Number(newType.минимальныйСрок),
        максимальныйСрок: Number(newType.максимальныйСрок),
        базоваяСтавка: Number(newType.базоваяСтавка)
      });
      setAddDialogOpen(false);
      setNewType({
        название: '',
        категория: '',
        минимальнаяСумма: '',
        максимальнаяСумма: '',
        минимальныйСрок: '',
        максимальныйСрок: '',
        базоваяСтавка: '',
        необходимоСтрахование: false,
        активный: true,
        описание: ''
      });
      setSuccessMessage('Вид кредита успешно добавлен');
      fetchCreditTypes();
    } catch (err) {
      setError(err.message || 'Ошибка при добавлении вида кредита');
    }
  };

  const handleEdit = (type) => {
    setSelectedType(type);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      validateCreditType(selectedType);
      await bankService.updateCreditType(selectedType.кодПродукта, selectedType);
      setEditDialogOpen(false);
      setSuccessMessage('Вид кредита успешно обновлен');
      fetchCreditTypes();
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении вида кредита');
    }
  };

  const handleDelete = (type) => {
    setSelectedType(type);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await bankService.deleteCreditType(selectedType.кодПродукта);
      setDeleteDialogOpen(false);
      setSuccessMessage('Вид кредита успешно удален');
      fetchCreditTypes();
    } catch (err) {
      setError('Ошибка при удалении вида кредита');
    }
  };

  const renderCreditTypeForm = (type, setType, isEdit = false) => (
    <>
      <TextField
        fullWidth
        label="Название"
        value={type?.название || ''}
        onChange={e => setType({ ...type, название: e.target.value })}
        margin="normal"
        required
        error={type?.название?.length < 5 || type?.название?.length > 100}
        helperText="От 5 до 100 символов"
      />
      <TextField
        select
        fullWidth
        label="Категория"
        value={type?.категория || ''}
        onChange={e => setType({ ...type, категория: e.target.value })}
        margin="normal"
        required
      >
        {CREDIT_CATEGORIES.map(cat => (
          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        label="Минимальная сумма"
        value={type?.минимальнаяСумма || ''}
        onChange={e => setType({ ...type, минимальнаяСумма: e.target.value.replace(/[^0-9]/g, '') })}
        margin="normal"
        type="number"
        inputProps={{ min: 0 }}
      />
      <TextField
        fullWidth
        label="Максимальная сумма"
        value={type?.максимальнаяСумма || ''}
        onChange={e => setType({ ...type, максимальнаяСумма: e.target.value.replace(/[^0-9]/g, '') })}
        margin="normal"
        type="number"
        inputProps={{ min: 0 }}
      />
      <TextField
        fullWidth
        label="Минимальный срок (месяцев)"
        value={type?.минимальныйСрок || ''}
        onChange={e => setType({ ...type, минимальныйСрок: e.target.value.replace(/[^0-9]/g, '') })}
        margin="normal"
        required
        type="number"
        inputProps={{ min: 1, max: 120 }}
        error={type?.минимальныйСрок < 1 || type?.минимальныйСрок > 120}
        helperText="От 1 до 120 месяцев"
      />
      <TextField
        fullWidth
        label="Максимальный срок (месяцев)"
        value={type?.максимальныйСрок || ''}
        onChange={e => setType({ ...type, максимальныйСрок: e.target.value.replace(/[^0-9]/g, '') })}
        margin="normal"
        required
        type="number"
        inputProps={{ min: 1, max: 360 }}
        error={type?.максимальныйСрок < 1 || type?.максимальныйСрок > 360}
        helperText="От 1 до 360 месяцев"
      />
      <TextField
        fullWidth
        label="Базовая ставка (%)"
        value={type?.базоваяСтавка || ''}
        onChange={e => setType({ ...type, базоваяСтавка: e.target.value.replace(/[^0-9.]/g, '') })}
        margin="normal"
        required
        type="number"
        inputProps={{ min: 0.01, max: 99.99, step: 0.01 }}
        error={type?.базоваяСтавка < 0.01 || type?.базоваяСтавка > 99.99}
        helperText="От 0.01% до 99.99%"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={type?.необходимоСтрахование || false}
            onChange={e => setType({ ...type, необходимоСтрахование: e.target.checked })}
          />
        }
        label="Необходимо страхование"
      />
      {isEdit && (
        <FormControlLabel
          control={
            <Checkbox
              checked={type?.активный || false}
              onChange={e => setType({ ...type, активный: e.target.checked })}
            />
          }
          label="Активный"
        />
      )}
      <TextField
        fullWidth
        label="Описание"
        value={type?.описание || ''}
        onChange={e => setType({ ...type, описание: e.target.value })}
        margin="normal"
        multiline
        rows={4}
        inputProps={{ maxLength: 500 }}
        helperText={`${type?.описание?.length || 0}/500`}
      />
    </>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
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

      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.5s ease-out'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceIcon sx={{ fontSize: 44, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Виды кредитов
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ 
            fontWeight: 700,
            borderRadius: 2,
            py: 1,
            px: 3,
            background: 'linear-gradient(90deg, #003366 0%, #00539B 100%)',
            '&:hover': {
              background: 'linear-gradient(90deg, #00539B 0%, #003366 100%)'
            }
          }}
        >
          Добавить вид кредита
        </Button>
      </Box>

      <Grid container spacing={3}>
        {creditTypes.map((type, index) => (
          <Grid 
            item 
            xs={12} 
            md={6} 
            key={type.кодПродукта}
            sx={{ 
              opacity: showContent ? 1 : 0,
              transform: showContent ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.5s ease-out ${index * 0.1}s`
            }}
          >
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              boxShadow: '0 4px 24px 0 rgba(0,51,102,0.13)',
              background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 36px 0 rgba(0,51,102,0.18)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                    {type.название}
                  </Typography>
                  <Box 
                    sx={{ 
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: type.активный ? '#4caf50' : '#f44336',
                      boxShadow: `0 0 8px ${type.активный ? '#4caf5080' : '#f4433680'}`,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Категория: <b>{type.категория}</b>
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Базовая ставка
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {type.базоваяСтавка}%
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Срок кредита
                  </Typography>
                  <Typography variant="body1">
                    от {type.минимальныйСрок} до {type.максимальныйСрок} месяцев
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Сумма кредита
                  </Typography>
                  <Typography variant="body1">
                    {type.минимальнаяСумма ? `от ${type.минимальнаяСумма?.toLocaleString()} ₽` : 'Без ограничений'} 
                    {type.максимальнаяСумма ? ` до ${type.максимальнаяСумма?.toLocaleString()} ₽` : ''}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Страхование
                  </Typography>
                  <Typography variant="body1" sx={{ color: type.необходимоСтрахование ? 'primary.main' : 'text.secondary' }}>
                    {type.необходимоСтрахование ? 'Требуется' : 'Не требуется'}
                  </Typography>
                </Box>
                {type.описание && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {type.описание}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(type)}
                    sx={{ 
                      flexGrow: 1,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(type)}
                    sx={{ 
                      flexGrow: 1,
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Диалог добавления */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить новый вид кредита</DialogTitle>
        <DialogContent>
          {renderCreditTypeForm(newType, setNewType)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAdd} variant="contained" color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать вид кредита</DialogTitle>
        <DialogContent>
          {renderCreditTypeForm(selectedType, setSelectedType, true)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот вид кредита? Это действие нельзя отменить.
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

export default CreditTypes; 