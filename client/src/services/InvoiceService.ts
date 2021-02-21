import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

// Service
import AuthService from './AuthService';

export class InvoiceService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "invoices/add", data, AuthService.tokenConfig());
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "invoices", AuthService.tokenConfig());
    }

    findExisting(data: any) {
        return axios.post(USER_API_BASE_URL + "invoices/findExisting", data, AuthService.tokenConfig());
    }

    generate(data: any) {
        return axios.post(USER_API_BASE_URL + "invoices/generate", data, AuthService.tokenConfig());
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "invoices/edit/" + _id, data, AuthService.tokenConfig());
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "invoices/softDelete", data, AuthService.tokenConfig());
    }
}

export default new InvoiceService();