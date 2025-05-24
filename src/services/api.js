import axios from 'axios';

const API_URL = 'https://localhost:7253/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const postService = {
    getPosts: async () => {
        const response = await api.get('/posts');
        return response.data;
    },
    createPost: async (postData) => {
        const response = await api.post('/posts', postData);
        return response.data;
    },
    updatePost: async (id, postData) => {
        const response = await api.put(`/posts/${id}`, postData);
        return response.data;
    },
    deletePost: async (id) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    },
};

export const bankService = {
    // Карты
    getCards: () => api.get('/cards'),
    getCard: (id) => api.get(`/cards/${id}`),
    createCard: (data) => api.post('/cards', data),
    updateCard: (id, data) => api.put(`/cards/${id}`, data),
    deleteCard: (id) => api.delete(`/cards/${id}`),
    blockCard: (id) => api.post(`/cards/${id}/block`),
    unblockCard: (id) => api.post(`/cards/${id}/unblock`),

    // Вклады
    getDeposits: () => api.get('/deposits'),
    getDeposit: (id) => api.get(`/deposits/${id}`),
    createDeposit: (data) => api.post('/deposits', data),
    updateDeposit: (id, data) => api.put(`/deposits/${id}`, data),
    deleteDeposit: (id) => api.delete(`/deposits/${id}`),
    closeDeposit: (id) => api.post(`/deposits/${id}/close`),
    searchDeposits: (term) => api.get(`/deposits/search?term=${encodeURIComponent(term)}`),

    // Кредиты
    getCredits: () => api.get('/credits'),
    getCredit: (id) => api.get(`/credits/${id}`),
    createCredit: (data) => api.post('/credits', data),
    updateCredit: (id, data) => api.put(`/credits/${id}`, data),
    deleteCredit: (id) => api.delete(`/credits/${id}`),
    approveCredit: (id) => api.post(`/credits/${id}/approve`),
    rejectCredit: (id) => api.post(`/credits/${id}/reject`),
    searchCredits: (term) => api.get(`/credits/search?term=${encodeURIComponent(term)}`),

    // Виды кредитов
    getCreditTypes: () => api.get('/credittypes'),
    createCreditType: (data) => api.post('/credittypes', data),
    deleteCreditType: (id) => api.delete(`/credittypes/${id}`),
    updateCreditType: (id, data) => api.put(`/credittypes/${id}`, data),

    // Транзакции
    getTransactions: () => api.get('/transactions'),
    getTransaction: (id) => api.get(`/transactions/${id}`),
    createTransaction: (data) => api.post('/transactions', data),
    cancelTransaction: (id) => api.post(`/transactions/${id}/cancel`),

    // Клиенты
    getClients: () => api.get('/clients'),
    getClient: (id) => api.get(`/clients/${id}`),
    createClient: (data) => api.post('/clients', data),
    updateClient: (id, data) => api.put(`/clients/${id}`, data),
    deleteClient: (id) => api.delete(`/clients/${id}`),

    // Счета
    getAccounts: () => api.get('/accounts'),
    createAccount: (data) => api.post('/accounts', data),

    // Связь счет-клиент
    getClientAccountsByClient: (clientId) => api.get(`/clientaccounts/by-client/${clientId}`),
    // Получить счёт по номеру
    getAccount: (accountNumber) => api.get(`/accounts/${accountNumber}`),
    // Карты по счету
    getCardsByAccount: (accountNumber) => api.get(`/cards/by-account/${accountNumber}`),

    // Вклады по счёту
    getDepositsByAccount: (accountNumber) => api.get(`/deposits/by-account/${accountNumber}`),
    // Кредиты по счёту
    getCreditsByAccount: (accountNumber) => api.get(`/credits/by-account/${accountNumber}`),

    // Получить все продукты клиента
    getClientProducts: (clientId) => api.get(`/clients/${clientId}/products`),

    // Связь счет-клиент
    createClientAccount: (data) => api.post('/clientaccounts', data),

    // Фото клиента
    uploadClientPhoto: async (clientId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await api.post(`/documents/client-photo/${clientId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    
    getClientPhoto: async (clientId) => {
        try {
            const response = await api.get(`/documents/client-photo/${clientId}`, {
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Error fetching photo:', error);
            return null;
        }
    },
    
    deleteClientPhoto: async (clientId) => {
        return await api.delete(`/documents/client-photo/${clientId}`);
    },
    
    getClientPhotoUrl: (clientId) => `${API_URL}/documents/client-photo/${clientId}?${new Date().getTime()}`,

};

export default api; 