import React, { useState, useEffect, useRef, useContext } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DeleteIcon from '@material-ui/icons/Delete';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputAdornment from '@material-ui/core/InputAdornment';

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

const StockReportPage = (props: any) => {
    const {
        setIsLoading,
        setSnackbarMessage,
        handleShowErrorSnackbar
    } = useContext(AppContext);

    const initialErrorState = {
        startDate: { type: [], status: false },
        endDate: { type: [], status: false },
        brandId: { type: [ERROR_TYPE.REQUIRED], status: false },
        productId: { type: [ERROR_TYPE.REQUIRED], status: false },
    };
    const initialFormDataState = {
        startDate: startOfDay(0),
        endDate: endOfDay(new Date()),
        brandId: LIST_DATA_TYPE.ALL,
        productId: ''
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
    const [initialTableData, setInitialTableData] = useState([] as any);
    const [isOpenCalendar, setIsOpenCalendar] = useState(false);
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);
    const [dateInfo, setDateInfo] = useState("...");

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
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
        }

        fetchData();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isLoaded && productData) {
            let tempTableData: any[] = [];
            Object.values(productData).forEach((product: any) => {
                tempTableData.push({
                    "brand": brandData[product.brandId],
                    "product": product,
                });
            })
            setInitialTableData(tempTableData);
        }
    }, [isLoaded]);

    const handleClickDateButton = () => {
        setIsOpenCalendar(true);
    }

    const handleCloseCalendarDialog = () => {
        setIsOpenCalendar(false);
    }

    const handleSelectDate = (date: any) => {
        setFormData({ ...formData, endDate: endOfDay(date) })
    }

    const submit = async (e: any) => {
        e.preventDefault();

        setIsLoading(true);

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
        }

        // Valid data        
        ShipmentService.getSpecific(formData).then((res: any) => {
            const shipments = res.data;
            let tempTableData = [...initialTableData] as any

            tempTableData.forEach((row: any) => {
                let totalStock = 0;
                Object.values(locationData).forEach((location: any) => {
                    row[location._id] = 0;
                    shipments.forEach((shipment: any) => {
                        if (shipment.productId === row.product._id) {
                            if (shipment.locationId === location._id) {
                                row[location._id] += actionData[shipment.actionId].value;
                                totalStock += actionData[shipment.actionId].value;
                            }
                        }
                    })
                })
                row.totalStock = totalStock;
            })

            setTableData(tempTableData);
            setDateInfo(format(formData.endDate, "MMM d, yyyy").toString());
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
        setIsLoading(false);
    };

    const columns = [
        {
            name: "brand", label: "Brand"
        },
        {
            name: "product", label: "Product"
        }
    ] as any;

    Object.values(locationData).forEach((location: any) => {
        columns.push({ name: location._id, label: location.name })
    })
    columns.push({ name: "totalStock", label: "Total Stock" })

    let data: any[] = [];

    tableData.forEach((td: any) => {
        const tempRow = { "brand": td.brand.name, "product": td.product.name, "totalStock": td.totalStock } as any;
        Object.values(locationData).forEach((location: any) => {
            tempRow[location._id] = td[location._id];
        })
        data.push(tempRow);
    })

    let productOptions: any[] = [];
    Object.values(productData).forEach((product: any) => {
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
            filename: 'stockSummary' + dateInfo + '.csv',
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
                        <Grid item xs={12} sm={5} style={{ paddingLeft: "40px", position: "relative" }}>
                            <TodayIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></TodayIcon>
                            <h2 style={{ marginTop: "0px", color: "black" }}>{dateInfo}</h2>
                        </Grid>
                        <Grid item xs={12} sm={5} style={{ paddingLeft: "40px", position: "relative" }}>
                            {/* <LabelIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></LabelIcon>
                            <h2 style={{ marginTop: "0px" }}>{brandData[formData.brandId] ? brandData[formData.brandId].name : LIST_DATA_TYPE.ALL}{formData.brandId !== LIST_DATA_TYPE.ALL && productData[formData.productId] ? " - " + productData[formData.productId].name : ""}</h2> */}
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            {/* <h1 style={{ marginTop: "-5px", color: "black" }}>{"#" + tableData.length}</h1> */}
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

                                    <IconBtn icon={TodayIcon} tooltip={"Set Date"} handleClick={handleClickDateButton}></IconBtn>
                                    <TextField
                                        id="input-date"
                                        label="Date"
                                        fullWidth={true}
                                        disabled
                                        value={format(formData.endDate, "MMM d, yyyy")}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <TodayIcon></TodayIcon>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button type="submit" fullWidth variant="contained" size="large" color="primary">
                                        {"Search"}
                                    </Button>
                                </form>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={9}>
                            <MuiThemeProvider theme={theme}>
                                <MUIDataTable
                                    title={"Stock Summary"}
                                    data={data}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </Grid>
                    </Grid>

                    <Dialog
                        open={isOpenCalendar}
                        onClose={handleCloseCalendarDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <Calendar
                            date={formData.endDate}
                            onChange={handleSelectDate}
                        />
                    </Dialog>
                </>
            )
            }
        </>
    );
}

export default StockReportPage;
