import { SHIPMENT_INFORMATION_TYPE, USER_ROLES } from "./enum";

export const USER_API_BASE_URL = '/api/';

export const userRoles = {
    admins: [String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN)],
    users: [String(USER_ROLES.NON_ADMIN)],
    all: [String(USER_ROLES.SUPER_ADMIN), String(USER_ROLES.ADMIN), String(USER_ROLES.NON_ADMIN)]
}

export const getShipmentInformation = (shipmentInformation: any) => {
    switch (shipmentInformation) {
        case SHIPMENT_INFORMATION_TYPE.SET_PRODUCT_SUCCESS:
            return {
                "message": "Product Successfully Set",
                "fontColor": "blue"
            };
        case SHIPMENT_INFORMATION_TYPE.SET_PRODUCT_FAIL:
            return {
                "message": "No Product Found",
                "fontColor": "red"
            };
        case SHIPMENT_INFORMATION_TYPE.ADD_SERIAL_NUMBER:
            return {
                "message": "Add Serial Number",
                "fontColor": "green"
            };
        case SHIPMENT_INFORMATION_TYPE.DUPLICATE_DATA:
            return {
                "message": "Data Duplicate / Not Found",
                "fontColor": "orange"
            };
        case SHIPMENT_INFORMATION_TYPE.DUPLICATE_DATA_CHANGE_WH_FROM:
            return {
                "message": "Duplicate Data At 'From' Location",
                "fontColor": "orange"
            };
        case SHIPMENT_INFORMATION_TYPE.DUPLICATE_DATA_CHANGE_WH_TO:
            return {
                "message": "Duplicate Data At 'To' Location",
                "fontColor": "orange"
            };
        case SHIPMENT_INFORMATION_TYPE.SOMETHING_ERROR:
            return {
                "message": "Something Error",
                "fontColor": "red"
            };
        default:
            return {
                "message": "...",
                "fontColor": "black"
            };
    }
}