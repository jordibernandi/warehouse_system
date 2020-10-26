import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { format, startOfDay, endOfDay } from 'date-fns'

import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import DescriptionIcon from '@material-ui/icons/Description';

// Types
import { ERROR_TYPE } from '../../types/enum';

// Utils
import FunctionUtil from '../../utils/FunctionUtil';

// Services
import UserService from '../../services/UserService';
import ProductService from '../../services/ProductService';
import BrandService from '../../services/BrandService';
import LocationService from '../../services/LocationService';
import ShipmentService from '../../services/ShipmentService';
import CustomerService from '../../services/CustomerService';
import ActionService from '../../services/ActionService';

const CheckSerialNumberPage = (props: any) => {
    const {
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const initialErrorState = {
        serialNumber: { type: [ERROR_TYPE.REQUIRED], status: false },
    };
    const initialFormDataState = {
        serialNumber: ''
    };
    const defaultErrorMessage = "Value is Empty or Invalid";

    const [isLoaded, setIsLoaded] = useState(false);
    const [userData, setUserData] = useState({} as any);
    const [locationData, setLocationData] = useState({} as any);
    const [customerData, setCustomerData] = useState({} as any);
    const [actionData, setActionData] = useState({} as any);
    const [brandData, setBrandData] = useState({} as any);
    const [productData, setProductData] = useState({} as any);
    const [productCodeData, setProductCodeData] = useState({} as any);
    const [tableData, setTableData] = useState([] as any);
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            let activeDataUser: any;
            let activeDataProduct: any;
            let activeDataProductCode: any;
            let activeDataBrand: any;
            let activeDataLocation: any;
            let activeDataCustomer: any;
            let activeDataAction: any;

            await UserService.getAll().then((res: any) => {
                activeDataUser = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await ProductService.getAll().then((res: any) => {
                activeDataProduct = FunctionUtil.getConvertArrayToAssoc(res.data);
                activeDataProductCode = FunctionUtil.getConvertArrayToAssoc(res.data, "code");
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await BrandService.getAll().then((res: any) => {
                activeDataBrand = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await LocationService.getAll().then((res: any) => {
                activeDataLocation = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await CustomerService.getAll().then((res: any) => {
                activeDataCustomer = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await ActionService.getAll().then((res: any) => {
                activeDataAction = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            setProductData(activeDataProduct);
            setProductCodeData(activeDataProductCode);
            setBrandData(activeDataBrand);
            setLocationData(activeDataLocation);
            setCustomerData(activeDataCustomer);
            setActionData(activeDataAction);
            setUserData(activeDataUser);
            setIsLoaded(true);
            setIsLoading(false);
        }

        fetchData();
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })

        if (e.target.value === "") {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: true } })
        } else {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: false } })
        }
    }

    const submit = async (e: any) => {
        e.preventDefault();

        let isValid = true;
        const tempError = { ...error };

        Object.keys(formData).forEach((key: any) => {
            if (formData[key].toString().trim() === "" && error[key].type.includes(ERROR_TYPE.REQUIRED)) {

                tempError[key] = {
                    ...tempError[key],
                    status: true
                }
                isValid = false;
            }

            if (error[key].type.includes(ERROR_TYPE.UNIQUE)) {
                let tempTableData = [...tableData];

                tempTableData.forEach((data: any) => {
                    if (formData[key] === data[key]) {
                        tempError[key] = {
                            ...tempError[key],
                            status: true
                        }
                        isValid = false;
                    }
                })
            }
        })

        setError(tempError);

        if (!isValid) {
            return;
        } else {
            setIsLoading(true);
        }

        // Valid data        
        ShipmentService.getSerialNumber(formData).then((res: any) => {
            let tempTableData: any[] = [];

            res.data.forEach((shipment: any) => {
                const productFound = productData[shipment.productId];
                tempTableData.push({
                    "_id": shipment._id,
                    "invoice": shipment.invoice,
                    "product": productFound,
                    "brand": brandData[productFound.brandId],
                    "location": locationData[shipment.locationId],
                    "customer": customerData[shipment.customerId],
                    "action": actionData[shipment.actionId],
                    "serialNumber": formData.serialNumber,
                    "user": userData[shipment.userId],
                    "createdAt": shipment.createdAt,
                });
            })
            setTableData(tempTableData);
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
        setIsLoading(false);
    };

    const columns = [
        {
            name: "_id",
            label: "ID",
            options: {
                display: false,
            }
        },
        {
            name: "invoice", label: "Invoice"
        },
        {
            name: "brand", label: "Brand"
        },
        {
            name: "product", label: "Product"
        },
        {
            name: "serialNumber", label: "Serial Number"
        },
        {
            name: "customer", label: "Customer"
        },
        {
            name: "action", label: "Action"
        },
        {
            name: "location", label: "Location"
        },
        {
            name: "quantity", label: "Quantity"
        },
        {
            name: "user", label: "PIC"
        },
        {
            name: "createdAt", label: "Created At"
        },
    ] as any;

    let data: any[] = [];
    tableData.forEach((td: any) => {
        data.push({ "_id": td._id, "invoice": td.invoice ? td.invoice : "-", "brand": td.brand.name, "product": td.product.name, "serialNumber": td.serialNumber, "customer": td.customer ? td.customer.name : "-", "action": td.action.name, "location": td.location.name, "quantity": td.action.value, "user": td.user.name, "createdAt": format(new Date(td.createdAt), "MMM d, yyyy HH:mm:ss") })
    })

    const options = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        selectableRows: "none" as any,
        downloadOptions:
        {
            filename: 'serialNumber ' + `${tableData.length > 0 ? tableData[0].serialNumber : "Not Found!"}` + '.csv',
            separator: ',',
            filterOptions: {
                useDisplayedColumnsOnly: true,
                useDisplayedRowsOnly: true
            }
        }
    };

    const theme = createMuiTheme({
        overrides: {
            MUIDataTable: {
                responsiveScroll: {
                    height: 'calc(100vh - 350px)'
                }
            }
        } as any
    });

    return (
        <>
            {isLoaded && (
                <>
                    <Grid container>
                        <Grid item xs={12} sm={5} style={{ paddingLeft: "40px", position: "relative" }}>
                            <DescriptionIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></DescriptionIcon>
                            <h2 style={{ marginTop: "0px", color: "black" }}>
                                {`Serial Number: ${tableData.length > 0 ? tableData[0].serialNumber : "Not Found!"}`}
                            </h2>
                        </Grid>
                        <Grid item xs={12} sm={5} style={{ paddingLeft: "40px", position: "relative" }}>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <h1 style={{ marginTop: "-5px", color: "black" }}>{"#" + tableData.length}</h1>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Paper style={{ height: '100%', padding: '20px' }}>
                                <form
                                    onSubmit={submit}
                                    autoComplete="off"
                                    noValidate
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={12}>
                                            <Typography variant="h6" gutterBottom>
                                                {"Check Serial Number"}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <TextField
                                                required
                                                value={formData.serialNumber}
                                                margin="normal"
                                                id="serialNumber"
                                                name="serialNumber"
                                                label="Serial Number"
                                                type="text"
                                                fullWidth
                                                onChange={handleChange}
                                                error={error.serialNumber.status}
                                                helperText={error.serialNumber.status ? defaultErrorMessage : ""}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <Button type="submit" fullWidth variant="contained" size="large" color="primary">
                                                {"Search"}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <MuiThemeProvider theme={theme}>
                                <MUIDataTable
                                    title={"List of Shipments"}
                                    data={data}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </Grid>
                    </Grid>
                </>
            )
            }
        </>
    );
}

export default CheckSerialNumberPage;