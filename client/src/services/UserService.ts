import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

// Service
import AuthService from './AuthService';

export class UserService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "users/add", data, AuthService.tokenConfig());
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "users", AuthService.tokenConfig());
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "users/edit/" + _id, data, AuthService.tokenConfig());
    }

    editWithPassword(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "users/editWithPassword/" + _id, data, AuthService.tokenConfig());
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "users/softDelete", data, AuthService.tokenConfig());
    }
}

export default new UserService();