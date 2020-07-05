import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

// Service
import AuthService from './AuthService';

export class ShipmentService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "shipments/add", data, AuthService.tokenConfig());
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "shipments", AuthService.tokenConfig());
    }

    getSpecific(data: any) {
        return axios.post(USER_API_BASE_URL + "shipments/specific", data, AuthService.tokenConfig());
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "shipments/edit/" + _id, data, AuthService.tokenConfig());
    }

    delete(data: any) {
        return axios.put(USER_API_BASE_URL + "shipments/delete", data, AuthService.tokenConfig());
    }
}

export default new ShipmentService();