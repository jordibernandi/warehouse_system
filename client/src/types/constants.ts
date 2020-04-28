import { SHIPMENT_INFORMATION_TYPE } from "./enum";

export const USER_API_BASE_URL = 'http://localhost:3000/api/';

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
                "message": "Duplicate Data",
                "fontColor": "orange"
            };
        case SHIPMENT_INFORMATION_TYPE.CHECK_FIRST_ERROR:
            return {
                "message": "Check First Data Not Found",
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