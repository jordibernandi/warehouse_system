const convertArrayToAssoc = (arrayData: any[], key?: string) => {
    let assocData: any = {};
    arrayData.forEach((data: any, index: any) => {
        if (key) {
            assocData[data[key]] = data;
        } else {
            assocData[data._id] = data;
        }
    })

    return assocData;
}

const makeCode = (length: number) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

class FunctionUtil {
    public static getConvertArrayToAssoc(arrayData: any[], key?: string) {
        return convertArrayToAssoc(arrayData, key);
    }

    public static getMakeCode(length: number) {
        return makeCode(length);
    }

    public static activeFilterFunction(item: any) {
        return (item.isActive);
    }
}

export default FunctionUtil;