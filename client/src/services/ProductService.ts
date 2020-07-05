import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

// Service
import AuthService from './AuthService';

export class ProductService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "products/add", data, AuthService.tokenConfig());
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "products", AuthService.tokenConfig());
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "products/edit/" + _id, data, AuthService.tokenConfig());
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "products/softDelete", data, AuthService.tokenConfig());
    }

    saveUpload(data: any[]) {
        return axios.post(USER_API_BASE_URL + "products/saveUpload", data, AuthService.tokenConfig());
    }
}

export default new ProductService();