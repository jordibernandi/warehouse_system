import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class ActionService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "actions/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "actions");
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "actions/edit/" + _id, data);
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "actions/softDelete", data);
    }
}

export default new ActionService();