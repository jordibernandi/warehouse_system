import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

// Service
import AuthService from './AuthService';

export class BrandService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "brands/add", data, AuthService.tokenConfig());
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "brands", AuthService.tokenConfig());
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "brands/edit/" + _id, data, AuthService.tokenConfig());
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "brands/softDelete", data, AuthService.tokenConfig());
    }
}

export default new BrandService();