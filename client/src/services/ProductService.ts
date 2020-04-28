import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class ProductService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "products/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "products");
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "products/edit/" + _id, data);
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "products/softDelete", data);
    }

    saveUpload(data: any[]) {
        return axios.post(USER_API_BASE_URL + "products/saveUpload", data);
    }
}

export default new ProductService();