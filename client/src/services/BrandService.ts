import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class BrandService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "brands/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "brands");
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "brands/edit/" + _id, data);
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "brands/softDelete", data);
    }
}

export default new BrandService();