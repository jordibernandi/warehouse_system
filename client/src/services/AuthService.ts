import axios from 'axios';

import { USER_API_BASE_URL } from '../types/constants';

export class AuthService {
    register(credentials: any) {
        return axios.post(USER_API_BASE_URL + "auth/register", credentials);
    }

    login(credentials: any) {
        return axios.post(USER_API_BASE_URL + "auth/login", credentials);
    }

    verifyCaptcha(dataToken: any) {
        return axios.post(USER_API_BASE_URL + "auth/verifyCaptcha", dataToken);
    }

    getUserInfo() {
        return JSON.parse(localStorage.getItem("userInfo") as any);
    }

    // Setup config/headers and token
    tokenConfig = () => {
        // Get token from localstorage
        const token = this.getUserInfo();

        // Headers
        const config: any = {
            headers: {
                'Content-type': 'application/json'
            }
        };

        // If token, add to headers
        if (token) {
            config.headers['x-auth-token'] = token;
        }

        return config;
    };

    logOut() {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("breadcrumb");
        localStorage.removeItem("clientView");
        this.setUserToken("");
    }

    getUserById(id: any) {
        return axios.get(USER_API_BASE_URL + "auth/user/" + id);
    }

    setUserToken(token: any) {
        axios.defaults.headers.common['Authorization'] = token;
    }

    updateUser(currentUserData: any, userName: any) {
        let formData = new FormData();
        formData.append("name", userName);
        return axios.put(USER_API_BASE_URL + "users/" + currentUserData.key, formData);
    }

    updateUserImage(currentUserData: any, userAvatarImage: any) {
        let formData = new FormData();
        formData.append("userimage", userAvatarImage[0]);
        return axios.post(USER_API_BASE_URL + "users/" + currentUserData.key + "/userimage", formData);
    }

    changePassword(currentUserData: any, currentPassword: any, newPassword: any, newRepeatPassword: any) {
        let formData = new FormData();
        formData.append("currentPassword", currentPassword);
        formData.append("newPassword", newPassword);
        formData.append("newRepeatPassword", newRepeatPassword);
        return axios.put(USER_API_BASE_URL + "users/" + currentUserData.key + "/changepassword", formData);
    }
}

export default new AuthService();