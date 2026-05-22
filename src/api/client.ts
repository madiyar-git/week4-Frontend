import axios from 'axios' // импортирую axios для сетевых запросов

export const api = axios.create({// создаю копию axios 
    baseURL: 'http://127.0.0.1:8000/api', // адрес куда направляется  
    timeout: 5000, // запрос обрывается если длится больше 5 секунд 
})