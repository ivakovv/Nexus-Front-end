import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cards from './pages/Cards';
import Deposits from './pages/Deposits';
import Credits from './pages/Credits';
import Transactions from './pages/Transactions';
import CardDetails from './pages/CardDetails';
import DepositDetails from './pages/DepositDetails';
import CreditDetails from './pages/CreditDetails';
import DepositStats from './pages/DepositStats';
import PaymentStats from './pages/PaymentStats';
import CreditTypes from './pages/CreditTypes';
import Clients from './pages/Clients';
import getTheme from './theme';

function App() {
  const [mode, setMode] = React.useState(() => localStorage.getItem('themeMode') || 'light');
  React.useEffect(() => { localStorage.setItem('themeMode', mode); }, [mode]);
  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar mode={mode} setMode={setMode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/cards/:id" element={<CardDetails />} />
          <Route path="/deposits/:id" element={<DepositDetails />} />
          <Route path="/credits/:id" element={<CreditDetails />} />
          <Route path="/deposits/stats" element={<DepositStats />} />
          <Route path="/transactions/stats" element={<PaymentStats />} />
          <Route path="/credittypes" element={<CreditTypes />} />
          <Route path="/clients" element={<Clients />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
