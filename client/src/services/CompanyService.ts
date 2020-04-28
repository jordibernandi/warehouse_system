import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class CompanyService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "companies/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "companies");
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "companies/edit/" + _id, data);
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "companies/softDelete", data);
    }
}

export default new CompanyService();