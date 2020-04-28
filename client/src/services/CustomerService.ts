import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class CustomerService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "customers/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "customers");
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "customers/edit/" + _id, data);
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "customers/softDelete", data);
    }
}

export default new CustomerService();