import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

// Service
import AuthService from './AuthService';

export class CustomerService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "customers/add", data, AuthService.tokenConfig());
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "customers", AuthService.tokenConfig());
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "customers/edit/" + _id, data, AuthService.tokenConfig());
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "customers/softDelete", data, AuthService.tokenConfig());
    }
}

export default new CustomerService();