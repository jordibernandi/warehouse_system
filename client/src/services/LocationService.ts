import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class LocationService {
    add(data: any) {
        return axios.post(USER_API_BASE_URL + "locations/add", data);
    }

    getAll() {
        return axios.get(USER_API_BASE_URL + "locations");
    }

    edit(_id: any, data: any) {
        return axios.put(USER_API_BASE_URL + "locations/edit/" + _id, data);
    }

    softDelete(data: any) {
        return axios.put(USER_API_BASE_URL + "locations/softDelete", data);
    }
}

export default new LocationService();