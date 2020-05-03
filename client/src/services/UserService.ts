import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class UserService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "users/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "users");
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "users/edit/" + _id, data);
    }

    editWithPassword(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "users/editWithPassword/" + _id, data);
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "users/softDelete", data);
    }
}

export default new UserService();