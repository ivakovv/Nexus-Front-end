import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Alert, CircularProgress, IconButton, Paper } from '@mui/material';
import { bankService } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTheme } from '@mui/material/styles';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [newClient, setNewClient] = useState({
    СерияПаспорта: '',
    НомерПаспорта: '',
    Фамилия: '',
    Имя: '',
    Отчество: '',
    Пол: '',
    ДатаВыдачиПаспорта: '',
    КемВыданПаспорт: '',
    МестоРождения: '',
    ДатаРождения: '',
    АдресРегистрации: '',
    АдресПроживания: '',
    СемейноеПоложение: '',
    НомерТелефона: '',
    Email: '',
    Инн: '',
    Снилс: '',
    ИсточникДохода: '',
    Работодатель: '',
    УровеньДохода: '',
    СтатусКлиента: '',
    ДатаРегистрацииВБанке: '',
    ДополнительныеСведения: '',
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const [search, setSearch] = useState('');
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [productsClient, setProductsClient] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsSearch, setProductsSearch] = useState('');
  const [productsError, setProductsError] = useState('');
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openAccountClient, setOpenAccountClient] = useState(null);
  const [accountForm, setAccountForm] = useState({
    номерСчета: '',
    типСчета: '',
    наименованиеСчета: '',
    бикБанка: '',
    кодФилиала: '',
    датаОткрытия: new Date().toISOString().slice(0, 10),
    датаЗакрытия: '',
    статус: 'Активен',
  });
  const [accountError, setAccountError] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [createdAccount, setCreatedAccount] = useState(null);
  const [createdAccountStatus, setCreatedAccountStatus] = useState('');
  const [clientPhotos, setClientPhotos] = useState({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [newClientPhoto, setNewClientPhoto] = useState(null);
  const [newClientPhotoPreview, setNewClientPhotoPreview] = useState('');
  const [photoUploadError, setPhotoUploadError] = useState('');

  const GENDERS = [
    { value: 'М', label: 'Мужской' },
    { value: 'Ж', label: 'Женский' },
  ];
  const MARITAL_STATUSES = [
    'В браке',
    'Не в браке',
    'Разведен(а)',
    'Вдовец/Вдова',
  ];
  const CLIENT_STATUSES = [
    'Активен',
    'Неактивен',
    'Заблокирован',
  ];

  const PRODUCT_TYPES = [
    { type: 'deposit', label: 'Вклады', icon: <SavingsIcon sx={{ fontSize: 28, color: 'success.main' }} /> },
    { type: 'credit', label: 'Кредиты', icon: <AccountBalanceIcon sx={{ fontSize: 28, color: 'warning.main' }} /> },
    { type: 'card', label: 'Карты', icon: <CreditCardIcon sx={{ fontSize: 28, color: 'primary.main' }} /> },
  ];

  const ACCOUNT_TYPES = [
    { value: 'Расчетный', label: 'Расчетный' },
    { value: 'Депозитный', label: 'Депозитный' },
    { value: 'Кредитный', label: 'Кредитный' },
    { value: 'Карточный', label: 'Карточный' }
  ];

  const ACCOUNT_STATUSES = [
    { value: 'Активен', label: 'Активен' },
    { value: 'Заблокирован', label: 'Заблокирован' },
    { value: 'Закрыт', label: 'Закрыт' }
  ];

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
    fetchClients();
  }, []);

  useEffect(() => {
    clients.forEach(client => {
      loadClientPhoto(client.id);
    });
  }, [clients]);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bankService.getClients();
      setClients(response.data);
    } catch (err) {
      setError('Не удалось загрузить клиентов');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (event) => {
    setPhotoUploadError('');
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setPhotoUploadError('Размер файла не должен превышать 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setPhotoUploadError('Пожалуйста, загрузите изображение');
        return;
      }
      setNewClientPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewClientPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setNewClientPhoto(null);
    setNewClientPhotoPreview('');
    setPhotoUploadError('');
  };

  const validatePassportSeries = (series) => /^[0-9]{4}$/.test(series);
  const validatePassportNumber = (number) => /^[0-9]{6}$/.test(number);
  const validatePhone = (phone) => {
    if (!phone) return true; 
    return /^\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(phone) ||
           /^8[0-9]{10}$/.test(phone) ||
           /^\+7[0-9]{10}$/.test(phone);
  };
  const validateINN = (inn) => /^[0-9]{12}$/.test(inn);
  const validateSNILS = (snils) => /^[0-9]{3}-[0-9]{3}-[0-9]{3} [0-9]{2}$/.test(snils);
  const validateEmail = (email) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddClient = async () => {
    setAddError('');
    
    if (!newClient.СерияПаспорта || !newClient.НомерПаспорта || !newClient.Фамилия || 
        !newClient.Имя || !newClient.Пол || !newClient.ДатаВыдачиПаспорта || 
        !newClient.КемВыданПаспорт || !newClient.МестоРождения || !newClient.ДатаРождения || 
        !newClient.АдресРегистрации || !newClient.Инн || !newClient.Снилс) {
      setAddError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!validatePassportSeries(newClient.СерияПаспорта)) {
      setAddError('Серия паспорта должна состоять из 4 цифр');
      return;
    }

    if (!validatePassportNumber(newClient.НомерПаспорта)) {
      setAddError('Номер паспорта должен состоять из 6 цифр');
      return;
    }

    if (!validatePhone(newClient.НомерТелефона)) {
      setAddError('Неверный формат номера телефона. Допустимые форматы: +7(XXX)XXX-XX-XX, 8XXXXXXXXXX или +7XXXXXXXXXX');
      return;
    }

    if (!validateEmail(newClient.Email)) {
      setAddError('Неверный формат email адреса');
      return;
    }

    if (!validateINN(newClient.Инн)) {
      setAddError('ИНН должен состоять из 12 цифр');
      return;
    }

    if (!validateSNILS(newClient.Снилс)) {
      setAddError('СНИЛС должен быть в формате XXX-XXX-XXX XX');
      return;
    }

    if (newClient.Пол !== 'М' && newClient.Пол !== 'Ж') {
      setAddError('Пол должен быть указан как М или Ж');
      return;
    }

    if (newClient.СемейноеПоложение && 
        !['В браке', 'Не в браке', 'Разведен(а)', 'Вдовец/Вдова'].includes(newClient.СемейноеПоложение)) {
      setAddError('Неверное значение семейного положения');
      return;
    }

    const minDate = new Date('2000-01-01');
    const birthDate = new Date(newClient.ДатаРождения);
    const issueDate = new Date(newClient.ДатаВыдачиПаспорта);
    
    if (birthDate > new Date()) {
      setAddError('Дата рождения не может быть в будущем');
      return;
    }

    if (issueDate < minDate) {
      setAddError('Дата выдачи паспорта не может быть раньше 01.01.2000');
      return;
    }

    try {
      const clientData = {
        ...newClient,
        СтатусКлиента: 'Активен', 
        ДатаРегистрацииВБанке: new Date().toISOString().split('T')[0],
        УровеньДохода: newClient.УровеньДохода ? Number(newClient.УровеньДохода) : null
      };

      const response = await bankService.createClient(clientData);
      const clientId = response.data.id;

      if (newClientPhoto) {
        const formData = new FormData();
        formData.append('file', newClientPhoto);
        await bankService.uploadClientPhoto(clientId, formData);
      }

      setAddDialogOpen(false);
      setNewClient({
        СерияПаспорта: '', НомерПаспорта: '', Фамилия: '', Имя: '', Отчество: '', 
        Пол: '', ДатаВыдачиПаспорта: '', КемВыданПаспорт: '', МестоРождения: '', 
        ДатаРождения: '', АдресРегистрации: '', АдресПроживания: '', СемейноеПоложение: '', 
        НомерТелефона: '', Email: '', Инн: '', Снилс: '', ИсточникДохода: '', 
        Работодатель: '', УровеньДохода: '', СтатусКлиента: '', 
        ДатаРегистрацииВБанке: '', ДополнительныеСведения: ''
      });
      setNewClientPhoto(null);
      setNewClientPhotoPreview('');

      const newClientData = response.data;
      setClients(prevClients => [newClientData, ...prevClients]);
    } catch (err) {
      setAddError(err.response?.data || 'Ошибка при добавлении клиента');
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      await bankService.deleteClient(id);
      fetchClients();
    } catch (err) {
      setError('Не удалось удалить клиента');
    }
  };

  const handleCardClick = (client) => {
    setSelectedClient(client);
    setEditClient({
      СерияПаспорта: client.серияПаспорта,
      НомерПаспорта: client.номерПаспорта,
      Фамилия: client.фамилия,
      Имя: client.имя,
      Отчество: client.отчество,
      Пол: client.пол,
      ДатаВыдачиПаспорта: client.датаВыдачиПаспорта,
      КемВыданПаспорт: client.кемВыданПаспорт,
      МестоРождения: client.местоРождения,
      ДатаРождения: client.датаРождения,
      АдресРегистрации: client.адресРегистрации,
      АдресПроживания: client.адресПроживания,
      СемейноеПоложение: client.семейноеПоложение,
      НомерТелефона: client.номерТелефона,
      Email: client.email,
      Инн: client.инн,
      Снилс: client.снилс,
      ИсточникДохода: client.источникДохода,
      Работодатель: client.работодатель,
      УровеньДохода: client.уровеньДохода,
      СтатусКлиента: client.статусКлиента,
      ДатаРегистрацииВБанке: client.датаРегистрацииВБанке,
      ДополнительныеСведения: client.дополнительныеСведения,
      id: client.id
    });
    setEditPhoto(null);
    setEditDialogOpen(true);
  };

  const loadClientPhoto = async (clientId) => {
    try {
      const photoUrl = await bankService.getClientPhoto(clientId);
      if (photoUrl) {
        setClientPhotos(prev => ({ ...prev, [clientId]: photoUrl }));
      }
    } catch (err) {
      console.error('Error loading photo:', err);
    }
  };

  const handleEditPhotoChange = async (e) => {
    if (!e.target.files || !e.target.files[0] || !editClient?.id) return;
    
    const file = e.target.files[0];
    setPhotoLoading(true);
    
    try {
      await bankService.uploadClientPhoto(editClient.id, file);
      const newPhotoUrl = await bankService.getClientPhoto(editClient.id);
      setEditPhoto(newPhotoUrl);
      setClientPhotos(prev => ({ ...prev, [editClient.id]: newPhotoUrl }));
    } catch (err) {
      alert('Ошибка загрузки фото: ' + (err?.response?.data || err.message));
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDeletePhoto = async (clientId, e) => {
    e.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите удалить фото клиента?')) return;
    
    try {
      await bankService.deleteClientPhoto(clientId);
      setClientPhotos(prev => ({ ...prev, [clientId]: null }));
      if (editClient?.id === clientId) {
        setEditPhoto(null);
      }
    } catch (err) {
      alert('Ошибка удаления фото: ' + (err?.response?.data || err.message));
    }
  };

  const handleSaveEditClient = async () => {
    setError('');

    if (editClient.НомерТелефона && !validatePhone(editClient.НомерТелефона)) {
      setError('Неверный формат номера телефона. Допустимые форматы: +7(XXX)XXX-XX-XX, 8XXXXXXXXXX или +7XXXXXXXXXX');
      return;
    }

    if (editClient.Email && !validateEmail(editClient.Email)) {
      setError('Неверный формат email адреса');
      return;
    }

    if (editClient.СемейноеПоложение && 
        !['В браке', 'Не в браке', 'Разведен(а)', 'Вдовец/Вдова'].includes(editClient.СемейноеПоложение)) {
      setError('Неверное значение семейного положения');
      return;
    }

    if (editClient.СтатусКлиента && 
        !['Активен', 'Неактивен', 'Заблокирован'].includes(editClient.СтатусКлиента)) {
      setError('Неверное значение статуса клиента');
      return;
    }

    try {
      const updateData = {
        СерияПаспорта: editClient.СерияПаспорта,
        НомерПаспорта: editClient.НомерПаспорта,
        Фамилия: editClient.Фамилия,
        Имя: editClient.Имя,
        Отчество: editClient.Отчество,
        Пол: editClient.Пол,
        ДатаВыдачиПаспорта: editClient.ДатаВыдачиПаспорта,
        КемВыданПаспорт: editClient.КемВыданПаспорт,
        МестоРождения: editClient.МестоРождения,
        ДатаРождения: editClient.ДатаРождения,
        АдресРегистрации: editClient.АдресРегистрации,
        АдресПроживания: editClient.АдресПроживания,
        СемейноеПоложение: editClient.СемейноеПоложение,
        НомерТелефона: editClient.НомерТелефона,
        Email: editClient.Email,
        Инн: editClient.Инн,
        Снилс: editClient.Снилс,
        ИсточникДохода: editClient.ИсточникДохода,
        Работодатель: editClient.Работодатель,
        УровеньДохода: editClient.УровеньДохода ? Number(editClient.УровеньДохода) : null,
        СтатусКлиента: editClient.СтатусКлиента,
        ДатаРегистрацииВБанке: editClient.ДатаРегистрацииВБанке,
        ДополнительныеСведения: editClient.ДополнительныеСведения
      };

      await bankService.updateClient(editClient.id, updateData);
      setEditDialogOpen(false);
      setSelectedClient(null);
      setEditClient(null);
      setEditPhoto(null);
      fetchClients();
    } catch (err) {
      setError(err.response?.data || 'Не удалось обновить данные клиента');
    }
  };

  const handleShowProducts = (client) => {
    setProductsClient(client);
    setProductsDialogOpen(true);
  };

  const handleCloseProducts = () => {
    setProductsDialogOpen(false);
    setProductsClient(null);
  };

  const handleOpenAccount = (client) => {
    setOpenAccountClient(client);
    setOpenAccountDialog(true);
    setAccountForm({
      номерСчета: '',
      типСчета: '',
      наименованиеСчета: '',
      бикБанка: '',
      кодФилиала: '',
      датаОткрытия: new Date().toISOString().slice(0, 10),
      датаЗакрытия: '',
      статус: 'Активен',
    });
    setAccountError('');
    setAccountSuccess('');
  };

  const handleCloseAccountDialog = () => {
    setOpenAccountDialog(false);
    setOpenAccountClient(null);
    setAccountForm({
      номерСчета: '',
      типСчета: '',
      наименованиеСчета: '',
      бикБанка: '',
      кодФилиала: '',
      датаОткрытия: new Date().toISOString().slice(0, 10),
      датаЗакрытия: '',
      статус: 'Активен',
    });
    setAccountError('');
    setAccountSuccess('');
    setAccountLoading(false);
    setCreatedAccount(null);
    setCreatedAccountStatus('');
  };

  const handleAccountFormChange = (field, value) => {
    setAccountForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmitOpenAccount = async () => {
  

    setAccountError('');
    setAccountSuccess('');
    setCreatedAccount(null);
    setCreatedAccountStatus('');

    if (!accountForm.типСчета || !accountForm.наименованиеСчета || !accountForm.бикБанка || !accountForm.кодФилиала || !accountForm.датаОткрытия) {
      const missingFields = [];
      if (!accountForm.типСчета) missingFields.push('Тип счета');
      if (!accountForm.наименованиеСчета) missingFields.push('Наименование счета');
      if (!accountForm.бикБанка) missingFields.push('БИК банка');
      if (!accountForm.кодФилиала) missingFields.push('Код филиала');
      if (!accountForm.датаОткрытия) missingFields.push('Дата открытия');
      
      console.warn('Не заполнены обязательные поля:', missingFields);
      setAccountError(`Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`);
      console.groupEnd();
      return;
    }

    if (accountForm.номерСчета && accountForm.номерСчета.length !== 20) {
      console.warn('Неверная длина номера счета:', accountForm.номерСчета.length);
      setAccountError('Номер счета должен содержать ровно 20 символов');
      console.groupEnd();
      return;
    }

    if (!accountForm.бикБанка || accountForm.бикБанка.length !== 9 || accountForm.бикБанка === '000000000') {
      setAccountError('БИК банка должен состоять из 9 цифр и не может быть равен 000000000');
      return;
    }

    if (!accountForm.кодФилиала || accountForm.кодФилиала.length !== 4) {
      setAccountError('Код филиала должен состоять из 4 цифр');
      return;
    }

    setAccountLoading(true);
    try {
      const accountData = {
        НомерСчета: accountForm.номерСчета || null,
        ТипСчета: accountForm.типСчета,
        НаименованиеСчета: accountForm.наименованиеСчета,
        БикБанка: accountForm.бикБанка,
        КодФилиала: accountForm.кодФилиала.padStart(4, '0'), 
        ДатаОткрытия: accountForm.датаОткрытия,
        ДатаЗакрытия: accountForm.датаЗакрытия || null,
        КлиентId: openAccountClient.id,
        Статус: accountForm.статус || 'Активен',
        Баланс: 0
      };

      const accRes = await bankService.createAccount(accountData);

      const номерСчета = accRes.data.номерСчета || accRes.data.НомерСчета;

      const accountDetailsRes = await bankService.getAccount(номерСчета);


      const clientAccountsRes = await bankService.getClientAccountsByClient(openAccountClient.id);

      const clientAccount = (clientAccountsRes.data || []).find(a => a.номерСчета === номерСчета || a.НомерСчета === номерСчета);

      setCreatedAccount(accountDetailsRes.data);
      setCreatedAccountStatus(clientAccount?.статус || clientAccount?.Статус || accountForm.статус);
    } catch (err) {
      console.error('Ошибка при создании счета:', err);
      setAccountError('Ошибка при открытии счета: ' + (err?.response?.data || err.message));
    } finally {
      setAccountLoading(false);
      console.groupEnd();
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      
      const clientAccountsResponse = await bankService.getClientAccountsByClient(productsClient.id);
      const clientAccounts = clientAccountsResponse.data || [];

      let allCards = [];
      let allDeposits = [];
      let allCredits = [];

      for (const account of clientAccounts) {
        const accountNumber = account.номерСчета || account.НомерСчета;
        
        try {
          const cardsResponse = await bankService.getCardsByAccount(accountNumber);
          
          if (cardsResponse.data) {
            const cards = cardsResponse.data.map(card => ({
              type: 'card',
              НомерКарты: card.номерКарты || card.НомерКарты,
              ТипКарты: card.типКарты || card.ТипКарты,
              ПлатежнаяСистема: card.платежнаяСистема || card.ПлатежнаяСистема,
              НомерСчета: card.номерСчета || card.НомерСчета,
              Статус: card.статус || card.Статус
            }));
            allCards = [...allCards, ...cards];
          }

          const depositsResponse = await bankService.getDepositsByAccount(accountNumber);
          
          if (depositsResponse.data) {
            const deposits = depositsResponse.data.map(deposit => ({
              type: 'deposit',
              НомерДепозитногоДоговора: deposit.номерДепозитногоДоговора || deposit.НомерДепозитногоДоговора,
              Название: deposit.название || deposit.Название,
              ТипДепозита: deposit.типДепозита || deposit.ТипДепозита,
              СуммаДепозита: deposit.суммаДепозита || deposit.СуммаДепозита,
              Валюта: deposit.валюта || deposit.Валюта,
              ПроцентнаяСтавка: deposit.процентнаяСтавка || deposit.ПроцентнаяСтавка,
              ДепозитныеСчета: deposit.депозитныеСчета || deposit.ДепозитныеСчета
            }));
            allDeposits = [...allDeposits, ...deposits];
          }

          const creditsResponse = await bankService.getCreditsByAccount(accountNumber);
          
          if (creditsResponse.data) {
            const credits = creditsResponse.data.map(credit => ({
              type: 'credit',
              НомерДоговора: credit.номерДоговора || credit.НомерДоговора,
              ВидКредита: credit.видКредита || credit.ВидКредита,
              НомерСчета: credit.номерСчета || credit.НомерСчета,
              Сумма: credit.сумма || credit.Сумма,
              Ставка: credit.ставка || credit.Ставка,
              Статус: credit.статус || credit.Статус
            }));
            allCredits = [...allCredits, ...credits];
          }
        } catch (err) {
          console.error(`Ошибка при получении продуктов для счета ${accountNumber}:`, err.response?.data || err.message);
          console.error('Полная ошибка:', err);
        }
      }
      const allProducts = [
        ...allCards,
        ...allDeposits,
        ...allCredits
      ];

      
      setProducts(allProducts);
    } catch (err) {
      const errorMessage = err.response?.data || err.message;
      console.error('Ошибка при загрузке продуктов:', errorMessage);
      console.error('Полная ошибка:', err);
      setProductsError(`Ошибка загрузки продуктов клиента: ${errorMessage}`);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (!productsDialogOpen || !productsClient) return;
    
    fetchProducts();
  }, [productsDialogOpen, productsClient]);

  const filteredProducts = products.filter(p => {
    const q = productsSearch.trim().toLowerCase();
    if (!q) return true;
    if (p.type === 'deposit') return (p.НомерДепозитногоДоговора || '').toLowerCase().includes(q);
    if (p.type === 'credit') return (p.НомерДоговора || '').toLowerCase().includes(q);
    if (p.type === 'card') return (p.НомерКарты || '').toLowerCase().includes(q);
    return false;
  });

  const groupedProducts = PRODUCT_TYPES.map(pt => ({
    ...pt,
    items: filteredProducts.filter(p => p.type === pt.type)
  }));
  const hasAnyProducts = products.length > 0;

  useEffect(() => {
    setTimeout(() => {
      setShowContent(true);
    }, 500);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ 
      mt: 4, 
      background: theme.palette.mode === 'dark' ? 'transparent' : '#f7f9fb', 
      minHeight: '100vh', 
      borderRadius: 4, 
      py: 4,
      ...animationStyles
    }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 2,
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.5s ease-out',
        pl: { xs: 2, sm: 3, md: 4 },
        pr: { xs: 2, sm: 3, md: 4 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{ 
            fontSize: 44, 
            color: 'primary.main',
            mr: 1,
            transform: 'translateX(-8px)'
          }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontWeight: 900, 
            letterSpacing: 1,
            mb: 0
          }}>
            Клиенты
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Поиск по ФИО"
            value={search}
            onChange={e => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 320 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ 
              fontWeight: 700, 
              borderRadius: 2, 
              py: 1, 
              px: 3,
              whiteSpace: 'nowrap'
            }} 
            onClick={() => setAddDialogOpen(true)}
          >
            Добавить клиента
          </Button>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
          sx={{ 
            width: '100%', 
            margin: '0 auto',
            justifyContent: 'center',
            alignItems: 'stretch',
            '& > .MuiGrid-item': {
              display: 'flex',
              width: '360px !important',
              maxWidth: '360px !important',
              flex: '0 0 360px !important'
            }
          }}
        >
          {clients.filter(client => {
            const fio = `${client.фамилия || ''} ${client.имя || ''} ${client.отчество || ''}`.toLowerCase();
            return fio.includes(search.trim().toLowerCase());
          }).map((client, index) => (
            <Grid item key={client.id}>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 5,
                  p: 3,
                  width: '100%',
                  height: '100%',
                  background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff',
                  boxShadow: '0 4px 24px 0 rgba(0,51,102,0.10)',
                  transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.03)',
                    boxShadow: '0 8px 32px 0 rgba(0,51,102,0.18)',
                    background: theme.palette.mode === 'dark' ? '#232936' : '#e3eafc',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  position: 'relative',
                  alignItems: 'center',
                  cursor: 'pointer',
                  animation: `fadeIn 0.7s ease-out ${index * 0.1}s`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                  color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                  '@keyframes fadeIn': {
                    from: { 
                      opacity: 0,
                      transform: 'scale(0.97) translateY(20px)'
                    },
                    to: { 
                      opacity: 1,
                      transform: 'scale(1) translateY(0)'
                    }
                  }
                }}
                onClick={() => handleCardClick(client)}
              >
                <IconButton sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: '#fff', boxShadow: 2, '&:hover': { bgcolor: '#ffeaea', color: '#d32f2f' }, width: 44, height: 44 }} onClick={e => { e.stopPropagation(); handleDeleteClient(client.id); }}>
                  <DeleteIcon color="error" sx={{ fontSize: 28 }} />
                </IconButton>
                <Box sx={{
                  borderRadius: '50%',
                  p: '3px',
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #1976d2 40%, #e3eafc 100%)',
                  display: 'inline-block',
                  position: 'relative',
                }}>
                  <Avatar
                    sx={{ width: 70, height: 70, bgcolor: '#fff', color: '#1976d2', fontSize: 36 }}
                    src={clientPhotos[client.id]}
                  >
                    <PersonIcon sx={{ fontSize: 44 }} />
                  </Avatar>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 20, mb: 1, textAlign: 'center' }}>{client.фамилия} {client.имя} {client.отчество}</Typography>
                <Divider sx={{ width: '100%', my: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Паспорт: {client.серияПаспорта} {client.номерПаспорта}</Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>Пол: {client.пол}</Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>Дата рождения: {client.датаРождения}</Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>ИНН: {client.инн}</Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>СНИЛС: {client.снилс}</Typography>
                <Divider sx={{ width: '100%', my: 1 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7 }}>
                  <PhoneIcon sx={{ fontSize: 18, color: '#1976d2' }} /> {client.номерТелефона ?? '—'}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7 }}>
                  <EmailIcon sx={{ fontSize: 18, color: '#1976d2' }} /> {client.email ?? '—'}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 700, color: client.статусКлиента === 'Активный' ? '#2ECC40' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7 }}>
                  <VerifiedUserIcon sx={{ fontSize: 18, color: client.статусКлиента === 'Активный' ? '#2ECC40' : '#888' }} /> Статус: {client.статусКлиента}
                </Typography>
                <Divider sx={{ width: '100%', my: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Адрес регистрации: {client.адресРегистрации}</Typography>
                {client.дополнительныеСведения && <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{client.дополнительныеСведения}</Typography>}
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 2, fontWeight: 700, borderRadius: 3, px: 2, py: 1, boxShadow: 1 }}
                  onClick={e => { e.stopPropagation(); handleShowProducts(client); }}
                >
                  Смотреть продукты
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 1, fontWeight: 700, borderRadius: 3, px: 2, py: 1, boxShadow: 1 }}
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={e => { e.stopPropagation(); handleOpenAccount(client); }}
                >
                  Открыть счет
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить нового клиента</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  border: '2px dashed #1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#2196f3',
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {newClientPhotoPreview ? (
                  <Avatar
                    src={newClientPhotoPreview}
                    sx={{ 
                      width: '100%', 
                      height: '100%',
                      animation: 'fadeIn 0.5s ease-out'
                    }}
                  />
                ) : (
                  <AddPhotoAlternateIcon sx={{ 
                    fontSize: 50, 
                    color: '#1976d2',
                    opacity: 0.7,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.1)'
                    }
                  }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #1976d2 0%, #00539B 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #00539B 0%, #1976d2 100%)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Загрузить фото
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </Button>
                {newClientPhotoPreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemovePhoto}
                    startIcon={<DeleteIcon />}
                    sx={{ 
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(211, 47, 47, 0.04)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Удалить
                  </Button>
                )}
              </Box>
              {photoUploadError && (
                <Typography 
                  color="error" 
                  variant="caption" 
                  sx={{ 
                    mt: 1,
                    animation: 'fadeIn 0.3s ease-out'
                  }}
                >
                  {photoUploadError}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Серия паспорта" value={newClient.СерияПаспорта} onChange={e => setNewClient({ ...newClient, СерияПаспорта: e.target.value.replace(/\D/g, '').slice(0,4) })} margin="normal" required helperText="4 цифры" inputProps={{ maxLength: 4 }} />
              <TextField fullWidth label="Номер паспорта" value={newClient.НомерПаспорта} onChange={e => setNewClient({ ...newClient, НомерПаспорта: e.target.value.replace(/\D/g, '').slice(0,6) })} margin="normal" required helperText="6 цифр" inputProps={{ maxLength: 6 }} />
              <TextField fullWidth label="Фамилия" value={newClient.Фамилия} onChange={e => setNewClient({ ...newClient, Фамилия: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Имя" value={newClient.Имя} onChange={e => setNewClient({ ...newClient, Имя: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Отчество" value={newClient.Отчество} onChange={e => setNewClient({ ...newClient, Отчество: e.target.value })} margin="normal" />
              <TextField select fullWidth label="Пол" value={newClient.Пол} onChange={e => setNewClient({ ...newClient, Пол: e.target.value })} margin="normal" required helperText="Выберите пол">
                {GENDERS.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Дата рождения" type="date" InputLabelProps={{ shrink: true }} value={newClient.ДатаРождения} onChange={e => setNewClient({ ...newClient, ДатаРождения: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Место рождения" value={newClient.МестоРождения} onChange={e => setNewClient({ ...newClient, МестоРождения: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Адрес регистрации" value={newClient.АдресРегистрации} onChange={e => setNewClient({ ...newClient, АдресРегистрации: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Адрес проживания" value={newClient.АдресПроживания} onChange={e => setNewClient({ ...newClient, АдресПроживания: e.target.value })} margin="normal" />
              <TextField select fullWidth label="Семейное положение" value={newClient.СемейноеПоложение} onChange={e => setNewClient({ ...newClient, СемейноеПоложение: e.target.value })} margin="normal" helperText="Выберите семейное положение (опционально)">
                <MenuItem value="">—</MenuItem>
                {MARITAL_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Номер телефона" value={newClient.НомерТелефона} onChange={e => setNewClient({ ...newClient, НомерТелефона: e.target.value.replace(/[^0-9+]/g, '').slice(0,12) })} margin="normal" helperText="Только российский номер, например +79991234567" />
              <TextField fullWidth label="Email" value={newClient.Email} onChange={e => setNewClient({ ...newClient, Email: e.target.value })} margin="normal" helperText="example@email.com" />
              <TextField fullWidth label="ИНН" value={newClient.Инн} onChange={e => setNewClient({ ...newClient, Инн: e.target.value.replace(/\D/g, '').slice(0,12) })} margin="normal" required helperText="12 цифр" inputProps={{ maxLength: 12 }} />
              <TextField fullWidth label="СНИЛС" value={newClient.Снилс} onChange={e => setNewClient({ ...newClient, Снилс: e.target.value.replace(/[^0-9- ]/g, '').slice(0,14) })} margin="normal" required helperText="XXX-XXX-XXX XX" inputProps={{ maxLength: 14 }} />
              <TextField fullWidth label="Источник дохода" value={newClient.ИсточникДохода} onChange={e => setNewClient({ ...newClient, ИсточникДохода: e.target.value })} margin="normal" />
              <TextField fullWidth label="Работодатель" value={newClient.Работодатель} onChange={e => setNewClient({ ...newClient, Работодатель: e.target.value })} margin="normal" />
              <TextField fullWidth label="Уровень дохода" value={newClient.УровеньДохода} onChange={e => setNewClient({ ...newClient, УровеньДохода: e.target.value })} margin="normal" type="number" />
              <TextField select fullWidth label="Статус клиента" value={newClient.СтатусКлиента} onChange={e => setNewClient({ ...newClient, СтатусКлиента: e.target.value })} margin="normal" required helperText="Выберите статус">
                {CLIENT_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Дата выдачи паспорта" type="date" InputLabelProps={{ shrink: true }} value={newClient.ДатаВыдачиПаспорта} onChange={e => setNewClient({ ...newClient, ДатаВыдачиПаспорта: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Кем выдан паспорт" value={newClient.КемВыданПаспорт} onChange={e => setNewClient({ ...newClient, КемВыданПаспорт: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Дата регистрации в банке" type="date" InputLabelProps={{ shrink: true }} value={newClient.ДатаРегистрацииВБанке} onChange={e => setNewClient({ ...newClient, ДатаРегистрацииВБанке: e.target.value })} margin="normal" required />
              <TextField fullWidth label="Дополнительные сведения" value={newClient.ДополнительныеСведения} onChange={e => setNewClient({ ...newClient, ДополнительныеСведения: e.target.value })} margin="normal" multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddClient} variant="contained" color="primary">Добавить</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Карточка клиента</DialogTitle>
        <DialogContent sx={{ background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff', color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
          {editClient && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  borderRadius: '50%',
                  p: '4px',
                  background: 'linear-gradient(135deg, #1976d2 40%, #e3eafc 100%)',
                  display: 'inline-block',
                  mb: 2,
                  position: 'relative',
                }}>
                  <Avatar
                    sx={{ width: 100, height: 100, bgcolor: '#fff', color: '#1976d2', fontSize: 48 }}
                    src={editPhoto || clientPhotos[editClient.id]}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  {photoLoading && (
                    <CircularProgress
                      size={100}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        zIndex: 1,
                      }}
                    />
                  )}
                </Box>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<EditIcon />}
                  sx={{ borderRadius: 3, fontWeight: 700, mt: 1, background: 'linear-gradient(90deg, #1976d2 0%, #00539B 100%)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg, #00539B 0%, #1976d2 100%)' } }}
                  disabled={photoLoading}
                >
                  {photoLoading ? 'Загрузка...' : 'Загрузить фото'}
                  <input type="file" accept="image/*" hidden onChange={handleEditPhotoChange} />
                </Button>
                {(editPhoto || clientPhotos[editClient.id]) && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeletePhoto(editClient.id, { stopPropagation: () => {} })}
                    disabled={photoLoading}
                    sx={{ borderRadius: 3, mt: 1 }}
                  >
                    Удалить фото
                  </Button>
                )}
              </Grid>
              <Grid item xs={12} sm={8}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Серия паспорта" value={editClient.СерияПаспорта || ''} onChange={e => setEditClient({ ...editClient, СерияПаспорта: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Номер паспорта" value={editClient.НомерПаспорта || ''} onChange={e => setEditClient({ ...editClient, НомерПаспорта: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Фамилия" value={editClient.Фамилия || ''} onChange={e => setEditClient({ ...editClient, Фамилия: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Имя" value={editClient.Имя || ''} onChange={e => setEditClient({ ...editClient, Имя: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Отчество" value={editClient.Отчество || ''} onChange={e => setEditClient({ ...editClient, Отчество: e.target.value })} margin="normal" />
                    <TextField select fullWidth label="Пол" value={editClient.Пол || ''} onChange={e => setEditClient({ ...editClient, Пол: e.target.value })} margin="normal" required>
                      {GENDERS.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
                    </TextField>
                    <TextField fullWidth label="Дата рождения" type="date" InputLabelProps={{ shrink: true }} value={editClient.ДатаРождения || ''} onChange={e => setEditClient({ ...editClient, ДатаРождения: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Место рождения" value={editClient.МестоРождения || ''} onChange={e => setEditClient({ ...editClient, МестоРождения: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Адрес регистрации" value={editClient.АдресРегистрации || ''} onChange={e => setEditClient({ ...editClient, АдресРегистрации: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Адрес проживания" value={editClient.АдресПроживания || ''} onChange={e => setEditClient({ ...editClient, АдресПроживания: e.target.value })} margin="normal" />
                    <TextField select fullWidth label="Семейное положение" value={editClient.СемейноеПоложение || ''} onChange={e => setEditClient({ ...editClient, СемейноеПоложение: e.target.value })} margin="normal">
                      <MenuItem value="">—</MenuItem>
                      {MARITAL_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Номер телефона" value={editClient.НомерТелефона || ''} onChange={e => setEditClient({ ...editClient, НомерТелефона: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Email" value={editClient.Email || ''} onChange={e => setEditClient({ ...editClient, Email: e.target.value })} margin="normal" />
                    <TextField fullWidth label="ИНН" value={editClient.Инн || ''} onChange={e => setEditClient({ ...editClient, Инн: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="СНИЛС" value={editClient.Снилс || ''} onChange={e => setEditClient({ ...editClient, Снилс: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Источник дохода" value={editClient.ИсточникДохода || ''} onChange={e => setEditClient({ ...editClient, ИсточникДохода: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Работодатель" value={editClient.Работодатель || ''} onChange={e => setEditClient({ ...editClient, Работодатель: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Уровень дохода" value={editClient.УровеньДохода || ''} onChange={e => setEditClient({ ...editClient, УровеньДохода: e.target.value })} margin="normal" type="number" />
                    <TextField select fullWidth label="Статус клиента" value={editClient.СтатусКлиента || ''} onChange={e => setEditClient({ ...editClient, СтатусКлиента: e.target.value })} margin="normal" required>
                      {CLIENT_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                    <TextField fullWidth label="Дата выдачи паспорта" type="date" InputLabelProps={{ shrink: true }} value={editClient.ДатаВыдачиПаспорта || ''} onChange={e => setEditClient({ ...editClient, ДатаВыдачиПаспорта: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Кем выдан паспорт" value={editClient.КемВыданПаспорт || ''} onChange={e => setEditClient({ ...editClient, КемВыданПаспорт: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Дата регистрации в банке" type="date" InputLabelProps={{ shrink: true }} value={editClient.ДатаРегистрацииВБанке || ''} onChange={e => setEditClient({ ...editClient, ДатаРегистрацииВБанке: e.target.value })} margin="normal" required />
                    <TextField fullWidth label="Дополнительные сведения" value={editClient.ДополнительныеСведения || ''} onChange={e => setEditClient({ ...editClient, ДополнительныеСведения: e.target.value })} margin="normal" multiline rows={2} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Закрыть</Button>
          <Button onClick={handleSaveEditClient} variant="contained" color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={productsDialogOpen} onClose={handleCloseProducts} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: '#fff' }}>
          Продукты клиента: {productsClient?.Фамилия} {productsClient?.Имя}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Поиск по номеру продукта"
              value={productsSearch}
              onChange={e => setProductsSearch(e.target.value)}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            {productsLoading && <CircularProgress size={24} sx={{ color: theme.palette.primary.main }} />}
          </Box>
          
          {productsError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: '#f44336',
                '& .MuiAlert-icon': { color: '#f44336' }
              }}
            >
              {productsError}
            </Alert>
          )}

          {!products.length && !productsLoading && (
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', mt: 2 }}>
              У клиента нет активных продуктов
            </Typography>
          )}

          {groupedProducts.map(group => (
            <Box key={group.type} sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 2,
                p: 1,
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                {group.icon}
                <Typography variant="h6" sx={{ 
                  color: '#fff',
                  fontWeight: 600
                }}>
                  {group.label} {group.items.length > 0 && `(${group.items.length})`}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {group.items.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper sx={{
                      p: 3,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      border: '1px dashed rgba(255, 255, 255, 0.1)'
                    }}>
                      {group.type === 'card' && (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon sx={{ fontSize: 20, opacity: 0.5 }} />
                          У клиента нет активных карт
                        </Typography>
                      )}
                      {group.type === 'deposit' && (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SavingsIcon sx={{ fontSize: 20, opacity: 0.5 }} />
                          У клиента нет активных вкладов
                        </Typography>
                      )}
                      {group.type === 'credit' && (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceIcon sx={{ fontSize: 20, opacity: 0.5 }} />
                          У клиента нет активных кредитов
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ) : (
                  group.items.map((product, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={`${group.type}-${idx}`}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : '#fff',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`,
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px) scale(1.02)',
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : '#e3eafc',
                            boxShadow: theme.palette.mode === 'dark' 
                              ? '0 8px 24px rgba(0, 0, 0, 0.6)' 
                              : '0 8px 24px rgba(0, 51, 102, 0.15)',
                            borderColor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : theme.palette.primary.main
                          },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5
                        }}
                        onClick={() => {
                          handleCloseProducts();
                          if (group.type === 'deposit') navigate(`/deposits/${product.НомерДепозитногоДоговора}`);
                          if (group.type === 'credit') navigate(`/credits/${product.НомерДоговора}`);
                          if (group.type === 'card') navigate(`/cards/${product.НомерКарты}`);
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          mb: 1,
                          pb: 1.5,
                          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`
                        }}>
                          {group.icon}
                          <Typography variant="subtitle1" sx={{ 
                            color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                            fontWeight: 700,
                            fontSize: '1.1rem'
                          }}>
                            {group.type === 'deposit' && `Депозит №${product.НомерДепозитногоДоговора}`}
                            {group.type === 'credit' && `Кредит №${product.НомерДоговора}`}
                            {group.type === 'card' && `Карта №${product.НомерКарты}`}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            {group.type === 'deposit' && (
                              <>
                                <SavingsIcon sx={{ fontSize: 18 }} />
                                Сумма: {product.СуммаДепозита?.toLocaleString()} {product.Валюта || '₽'}
                              </>
                            )}
                            {group.type === 'credit' && (
                              <>
                                <AccountBalanceIcon sx={{ fontSize: 18 }} />
                                Сумма: {product.Сумма?.toLocaleString()} ₽
                              </>
                            )}
                            {group.type === 'card' && (
                              <>
                                <CreditCardIcon sx={{ fontSize: 18 }} />
                                Тип: {product.ТипКарты || 'Не указан'}
                              </>
                            )}
                          </Typography>

                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                            mb: 1
                          }}>
                            {group.type === 'deposit' && `Ставка: ${product.ПроцентнаяСтавка}%`}
                            {group.type === 'credit' && `Ставка: ${product.Ставка}%`}
                            {group.type === 'card' && `Платежная система: ${product.ПлатежнаяСистема || 'Не указана'}`}
                          </Typography>

                          <Typography variant="body2" sx={{ 
                            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                            mb: 1
                          }}>
                            {group.type === 'deposit' && product.ДепозитныеСчета && `Счёт: ${product.ДепозитныеСчета.НомерСчета}`}
                            {group.type === 'credit' && `Счёт: ${product.НомерСчета}`}
                            {group.type === 'card' && `Счёт: ${product.НомерСчета}`}
                          </Typography>
                        </Box>

                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          pt: 1.5,
                          mt: 'auto',
                          borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`
                        }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: (group.type === 'deposit' && product.ДепозитныеСчета?.Статус === 'Активен' || 
                                           group.type !== 'deposit' && product.Статус === 'Активен') ? '#4caf50' : 
                                          (group.type === 'deposit' && product.ДепозитныеСчета?.Статус === 'Закрыт' || 
                                           group.type !== 'deposit' && product.Статус === 'Закрыт') ? '#f44336' : '#ff9800'
                          }} />
                          <Typography variant="body2" sx={{ 
                            color: (group.type === 'deposit' && product.ДепозитныеСчета?.Статус === 'Активен' || 
                                   group.type !== 'deposit' && product.Статус === 'Активен') ? '#4caf50' : 
                                  (group.type === 'deposit' && product.ДепозитныеСчета?.Статус === 'Закрыт' || 
                                   group.type !== 'deposit' && product.Статус === 'Закрыт') ? '#f44336' : '#ff9800',
                            fontWeight: 600
                          }}>
                            {group.type === 'deposit' ? product.ДепозитныеСчета?.Статус : product.Статус || 'Не указан'}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseProducts}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAccountDialog} onClose={handleCloseAccountDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Открыть счет для клиента {openAccountClient ? `${openAccountClient.фамилия} ${openAccountClient.имя}` : ''}</DialogTitle>
        <DialogContent sx={{ background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff', color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
          {accountError && <Alert severity="error" sx={{ mb: 2 }}>{accountError}</Alert>}
          {!createdAccount && (
            <>
              <TextField
                fullWidth
                label="Номер счета (опционально)"
                value={accountForm.номерСчета}
                onChange={e => handleAccountFormChange('номерСчета', e.target.value.replace(/[^0-9]/g, '').slice(0, 20))}
                margin="normal"
                inputProps={{ maxLength: 20 }}
                helperText="20 символов, если оставить пустым — сгенерируется автоматически"
              />
              <TextField
                select
                fullWidth
                label="Тип счета"
                value={accountForm.типСчета}
                onChange={e => handleAccountFormChange('типСчета', e.target.value)}
                margin="normal"
                required
                helperText="Выберите тип счета"
              >
                {ACCOUNT_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField
                fullWidth
                label="Наименование счета"
                value={accountForm.наименованиеСчета}
                onChange={e => handleAccountFormChange('наименованиеСчета', e.target.value)}
                margin="normal"
                required
                helperText="Например: Основной, Зарплатный, Сберегательный и т.д."
              />
              <TextField
                fullWidth
                label="БИК банка"
                value={accountForm.бикБанка}
                onChange={e => handleAccountFormChange('бикБанка', e.target.value.replace(/\D/g, '').slice(0,9))}
                margin="normal"
                required
                helperText="9 цифр БИК банка"
                inputProps={{ maxLength: 9 }}
              />
              <TextField
                fullWidth
                label="Код филиала"
                value={accountForm.кодФилиала}
                onChange={e => handleAccountFormChange('кодФилиала', e.target.value.replace(/\D/g, '').slice(0,4))}
                margin="normal"
                required
                helperText="4 цифр кода филиала"
                inputProps={{ maxLength: 6 }}
              />
              <TextField
                fullWidth
                label="Дата открытия"
                type="date"
                value={accountForm.датаОткрытия}
                onChange={e => handleAccountFormChange('датаОткрытия', e.target.value)}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                helperText="Дата открытия счета"
              />
              <TextField
                fullWidth
                label="Дата закрытия (опционально)"
                type="date"
                value={accountForm.датаЗакрытия}
                onChange={e => handleAccountFormChange('датаЗакрытия', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                helperText="Дата закрытия счета (если есть)"
              />
              <TextField
                select
                fullWidth
                label="Статус счета"
                value={accountForm.статус}
                onChange={e => handleAccountFormChange('статус', e.target.value)}
                margin="normal"
                required
                helperText="Выберите статус счета"
              >
                {ACCOUNT_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </>
          )}
          {createdAccount && (
            <Box sx={{ mt: 2, mb: 1, p: 2, border: '1px solid #e0e0e0', borderRadius: 4, background: theme.palette.mode === 'dark' ? '#1a1d23' : '#fff', boxShadow: '0 4px 24px 0 rgba(0,51,102,0.13)', color: theme.palette.mode === 'dark' ? '#fff' : 'inherit' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Счет успешно открыт!</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>№ {createdAccount.номерСчета || createdAccount.НомерСчета}</Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>{createdAccount.типСчета || createdAccount.ТипСчета} — {createdAccount.наименованиеСчета || createdAccount.НаименованиеСчета}</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>БИК: {createdAccount.бикБанка || createdAccount.БикБанка} | Филиал: {createdAccount.кодФилиала || createdAccount.КодФилиала}</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>Открыт: {createdAccount.датаОткрытия ? new Date(createdAccount.датаОткрытия).toLocaleDateString() : createdAccount.ДатаОткрытия ? new Date(createdAccount.ДатаОткрытия).toLocaleDateString() : ''}
                {createdAccount.датаЗакрытия || createdAccount.ДатаЗакрытия ? ` | Закрыт: ${new Date(createdAccount.датаЗакрытия || createdAccount.ДатаЗакрытия).toLocaleDateString()}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: createdAccountStatus === 'Активен' ? 'green' : 'red', fontWeight: 700 }}>Статус: {createdAccountStatus}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!createdAccount && <Button onClick={handleCloseAccountDialog}>Отмена</Button>}
          {!createdAccount && <Button onClick={handleSubmitOpenAccount} variant="contained" color="success" disabled={accountLoading}>{accountLoading ? 'Открытие...' : 'Открыть счет'}</Button>}
          {createdAccount && <Button onClick={handleCloseAccountDialog} variant="contained" color="primary">Готово</Button>}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Clients; 