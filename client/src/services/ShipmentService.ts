import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class ShipmentService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "shipments/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "shipments");
    }

    getSpecific(data: any) {
        return axios.post(USER_API_BASE_URL + "shipments/specific", data);
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "shipments/edit/" + _id, data);
    }

    delete(data: any) {
        return axios.put(USER_API_BASE_URL + "shipments/delete", data);
    }
}

export default new ShipmentService();