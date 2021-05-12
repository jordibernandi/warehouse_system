import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { v4 as uuidv4 } from 'uuid';
import { format, isSameDay } from 'date-fns'

import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';

// Layouts
import IconBtn from '../appLayout/IconBtn';
import LabelIcon from '@material-ui/icons/Label';
import TodayIcon from '@material-ui/icons/Today';

// Types
import { ERROR_TYPE, LIST_DATA_TYPE } from '../../types/enum';

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
import InvoiceService from '../../services/InvoiceService';

// Enum
import { USER_ROLES } from '../../types/enum';

const ShipmentReportPage = (props: any) => {
    const {
        loginData,
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const initialErrorState = {
        brandId: { type: [ERROR_TYPE.REQUIRED], status: false },
        productId: { type: [ERROR_TYPE.REQUIRED], status: false },
    };
    const initialFormDataState = {
        brandId: '',
        productId: ''
    };
    const defaultErrorMessage = "Value is Empty or Invalid";

    const [isLoaded, setIsLoaded] = useState(false);
    const [userData, setUserData] = useState({} as any);
    const [invoiceData, setInvoiceData] = useState({} as any);
    const [locationData, setLocationData] = useState({} as any);
    const [customerData, setCustomerData] = useState({} as any);
    const [actionData, setActionData] = useState({} as any);
    const [brandData, setBrandData] = useState({} as any);
    const [productData, setProductData] = useState({} as any);
    const [productCodeData, setProductCodeData] = useState({} as any);
    const [tableData, setTableData] = useState([] as any);
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);
    const [isChangeBrand, setIsChangeBrand] = useState(uuidv4());
    const [productInfo, setProductInfo] = useState("...");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            let dataUser: any;
            let dataInvoice: any;
            let dataProduct: any;
            let dataProductCode: any;
            let dataBrand: any;
            let dataLocation: any;
            let dataCustomer: any;
            let dataAction: any;

            await UserService.getAll().then((res: any) => {
                dataUser = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await InvoiceService.getAll().then((res: any) => {
                dataInvoice = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await ProductService.getAll().then((res: any) => {
                dataProduct = FunctionUtil.getConvertArrayToAssoc(res.data);
                dataProductCode = FunctionUtil.getConvertArrayToAssoc(res.data, "code");
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await BrandService.getAll().then((res: any) => {
                dataBrand = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await LocationService.getAll().then((res: any) => {
                dataLocation = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await CustomerService.getAll().then((res: any) => {
                dataCustomer = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            await ActionService.getAll().then((res: any) => {
                dataAction = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            setInvoiceData(dataInvoice);
            setProductData(dataProduct);
            setProductCodeData(dataProductCode);
            setBrandData(dataBrand);
            setLocationData(dataLocation);
            setCustomerData(dataCustomer);
            setActionData(dataAction);
            setUserData(dataUser);
            setIsLoaded(true);
            setIsLoading(false);
        }

        fetchData();
    }, []);

    const handleChangeAutoComplete = (e: any, values: any) => {
        if (values) {
            setFormData({ ...formData, productId: values._id })
            setError({ ...error, productId: { ...error.productId, status: false } })
        } else {
            setError({ ...error, productId: { ...error.productId, status: true } })
        }
    }

    const handleChange = (e: any) => {
        if (e.target.name === "brandId") {
            setIsChangeBrand(uuidv4())
            setFormData({ ...formData, [e.target.name]: e.target.value, productId: "" })
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value })
        }

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
                if (key === "productId" && formData.brandId === LIST_DATA_TYPE.ALL) {
                } else {
                    tempError[key] = {
                        ...tempError[key],
                        status: true
                    }
                    isValid = false;
                }
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
        await ShipmentService.getSpecific(formData).then((res: any) => {
            let filteredData: any[] = [];
            let tempTableData: any[] = [];

            const uniqueDates = res.data.map((item: any) => format(new Date(item.createdAt), "MMM d, yyyy")).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            const uniqueActionIds = res.data.map((item: any) => item.actionId).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            const uniqueInvoiceIds = res.data.map((item: any) => item.invoiceId).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            const uniqueLocationIds = res.data.map((item: any) => item.locationId).filter((value: any, index: any, self: any) => self.indexOf(value) === index);

            let total = 0;

            uniqueDates.forEach((uniqueDate: any) => {
                let tempDate = { date: uniqueDate, actions: [] as any }
                uniqueActionIds.forEach((uniqueActionId: any) => {
                    let tempAction = { action: actionData[uniqueActionId], invoices: [] as any }
                    uniqueInvoiceIds.forEach((uniqueInvoiceId: any) => {
                        let tempInvoice = { invoice: uniqueInvoiceId ? invoiceData[uniqueInvoiceId] : null, locations: [] as any }
                        uniqueLocationIds.forEach((uniqueLocationId: any) => {
                            let tempLocation = { location: locationData[uniqueLocationId], quantity: 0, total: total, count: 0 }
                            res.data.forEach((shipment: any) => {
                                if (isSameDay(new Date(shipment.createdAt), new Date(uniqueDate)) && shipment.actionId === uniqueActionId && shipment.invoiceId === uniqueInvoiceId && shipment.locationId === uniqueLocationId) {
                                    tempLocation.quantity += tempAction.action.value;
                                    tempLocation.count++;
                                }
                            })
                            if (tempLocation.count > 0) {
                                total += tempLocation.quantity;
                                tempLocation.total = total;
                                tempInvoice.locations.push(tempLocation);
                            }
                        })
                        if (tempInvoice.locations.length > 0) {
                            tempAction.invoices.push(tempInvoice);
                        }
                    })
                    if (tempAction.invoices.length > 0) {
                        tempDate.actions.push(tempAction);
                    }
                })
                filteredData.push(tempDate);
            })

            filteredData.forEach((uniqueDate: any) => {
                uniqueDate.actions.forEach((uniqueAction: any) => {
                    uniqueAction.invoices.forEach((uniqueInvoice: any) => {
                        uniqueInvoice.locations.forEach((uniqueLocation: any) => {
                            tempTableData.push({
                                date: uniqueDate.date,
                                action: uniqueAction.action,
                                location: uniqueLocation.location,
                                invoice: uniqueInvoice.invoice,
                                quantity: uniqueLocation.quantity,
                                total: uniqueLocation.total
                            })
                        })
                    })
                })
            })
            setTableData(tempTableData);
            setProductInfo(brandData[formData.brandId].name + " - " + productData[formData.productId].name);
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
        setIsLoading(false);
    };

    const columns = [
        {
            name: "date", label: "Date"
        },
        {
            name: "action", label: "Action"
        },
        {
            name: "location", label: "Location"
        },
        {
            name: "invoice", label: "Invoice"
        },
        {
            name: "customer", label: "Customer"
        },
        {
            name: "description", label: "Description"
        },
        {
            name: "quantity", label: "Quantity"
        },
        {
            name: "total", label: "Total"
        },
    ] as any;

    let data: any[] = [];
    tableData.forEach((td: any) => {
        data.push({ "date": td.date, "action": td.action ? td.action.name : "-", "location": td.location ? td.location.name : "-", "invoice": td.invoice ? td.invoice.name : "-", "customer": td.invoice ? customerData[td.invoice.customerId].name : "-", "description": td.invoice ? td.invoice.description : "-", "quantity": td.quantity, "total": td.total })
    })

    let productOptions: any[] = [];
    Object.values(productData).filter(FunctionUtil.activeFilterFunction).forEach((product: any) => {
        if (product.brandId === formData.brandId) {
            productOptions.push(product);
        }
    })

    const options = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        selectableRows: "none" as any,
        downloadOptions:
        {
            filename: 'productReport ' + productInfo + '.csv',
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
                    height: 'calc(100vh - 354px)'
                }
            }
        } as any
    });

    return (
        <>
            {isLoaded && (
                <>
                    <Grid container>
                        <Grid item xs={12} sm={12} style={{ paddingLeft: "40px", position: "relative" }}>
                            <LabelIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></LabelIcon>
                            <h2 style={{ marginTop: "0px" }}>{brandData[formData.brandId] ? brandData[formData.brandId].name : "-"}{formData.brandId && productData[formData.productId] ? " - " + productData[formData.productId].name : ""}</h2>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={3}>
                            <Paper style={{ height: '100%', padding: '20px' }}>
                                <form
                                    onSubmit={submit}
                                    autoComplete="off"
                                    noValidate
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={12}>
                                            <FormControl style={{ width: "100%" }} required error={error.brandId.status}>
                                                <InputLabel id="brand-label">{"Brand"}</InputLabel>
                                                <Select
                                                    labelId="brand-label"
                                                    id="brandId"
                                                    name="brandId"
                                                    value={formData.brandId ? formData.brandId : ""}
                                                    onChange={handleChange}
                                                    error={error.brandId.status}
                                                >
                                                    {Object.values(brandData).filter(FunctionUtil.activeFilterFunction).map((data: any) => {
                                                        return (
                                                            <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                                <FormHelperText>{error.brandId.status ? defaultErrorMessage : ""}</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <Autocomplete
                                                key={isChangeBrand}
                                                id="productId"
                                                options={productOptions}
                                                getOptionLabel={(option: any) => option.name}
                                                fullWidth={true}
                                                size={"small"}
                                                onChange={handleChangeAutoComplete}
                                                renderInput={(params) => <TextField required {...params} label="Product" variant="outlined" />}
                                            />
                                            <FormHelperText style={{ color: "red" }}>{error.productId.status ? defaultErrorMessage : ""}</FormHelperText>
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
                        <Grid item xs={12} sm={9}>
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

export default ShipmentReportPage;
