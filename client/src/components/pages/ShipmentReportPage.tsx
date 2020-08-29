import React, { useState, useEffect, useRef, useContext } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfDay, endOfDay } from 'date-fns'
import { DateRangePicker } from 'react-date-range';
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
import ShipmentSummaryDialog from '../appLayout/ShipmentSummaryDialog';

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

const ShipmentReportPage = (props: any) => {
    const {
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const initialErrorState = {
        startDate: { type: [], status: false },
        endDate: { type: [], status: false },
        brandId: { type: [ERROR_TYPE.REQUIRED], status: false },
        productId: { type: [ERROR_TYPE.REQUIRED], status: false },
    };
    const initialFormDataState = {
        startDate: startOfDay(new Date()),
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
    const [isOpenConfirmationDialog, setIsOpenConfirmationDialog] = useState(false);
    const [isOpenCalendar, setIsOpenCalendar] = useState(false);
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);
    const [selectedData, setSelectedData] = useState([] as any[]);
    const [useDate, setUseDate] = useState(true);
    const [isChangeBrand, setIsChangeBrand] = useState(uuidv4());
    const [dateInfo, setDateInfo] = useState("...");
    const [productInfo, setProductInfo] = useState("...");
    const [isOpenShipmentSummaryDialog, setIsOpenShipmentSummaryDialog] = useState(false);

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

    const handleClickShipmentSummaryButton = () => {
        setIsOpenShipmentSummaryDialog(true);
    }

    const handleCloseShipmentSummaryDialog = () => {
        setIsOpenShipmentSummaryDialog(false);
    }

    const handleCloseConfirmationDialog = () => {
        setIsOpenConfirmationDialog(false);
        setSelectedData([]);
    }

    const handleChangeUseDate = (e: any) => {
        setUseDate(!useDate);
        if (!useDate) {
            setFormData({ ...formData, startDate: initialFormDataState.startDate, endDate: initialFormDataState.endDate });
        } else {
            setFormData({ ...formData, startDate: "", endDate: "" });
        }
    }

    const handleClickDateButton = () => {
        setIsOpenCalendar(true);
    }

    const handleCloseCalendarDialog = () => {
        setIsOpenCalendar(false);
    }

    const handleSelectDate = (ranges: any) => {
        setFormData({ ...formData, startDate: startOfDay(ranges.selection.startDate), endDate: endOfDay(ranges.selection.endDate) })
    }

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

    const handleClickDeleteButton = (selectedRows: any) => {
        let tempSelectedData: any[] = [];

        selectedRows.data.forEach((sr: any) => {
            tempSelectedData.push(tableData[sr.dataIndex]._id);
        })

        setSelectedData(tempSelectedData);
        setIsOpenConfirmationDialog(true);
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
        ShipmentService.getSpecific(formData).then((res: any) => {
            let tempTableData: any[] = [];

            res.data.forEach((shipment: any) => {
                const productFound = productData[shipment.productId];
                tempTableData.push({
                    "_id": shipment._id,
                    "product": productFound,
                    "brand": brandData[productFound.brandId],
                    "location": locationData[shipment.locationId],
                    "customer": customerData[shipment.customerId],
                    "action": actionData[shipment.actionId],
                    "serialNumber": shipment.serialNumber,
                    "user": userData[shipment.userId],
                    "createdAt": shipment.createdAt,
                });
            })
            setTableData(tempTableData);
            if (useDate) {
                setDateInfo(format(formData.startDate, "MMM d, yyyy").toString() + " - " + format(formData.endDate, "MMM d, yyyy").toString());
            } else {
                setDateInfo(LIST_DATA_TYPE.ALL + "-Dates");
            }
            if (brandData[formData.brandId] && formData.brandId !== LIST_DATA_TYPE.ALL && productData[formData.productId]) {
                setProductInfo(brandData[formData.brandId].name + " - " + productData[formData.productId].name);
            } else {
                setProductInfo(LIST_DATA_TYPE.ALL + "-Products");
            }
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
        setIsLoading(false);
    };

    const submitDelete = async (e: any) => {
        e.preventDefault();

        setIsLoading(true);

        ShipmentService.delete({ selectedData: selectedData }).then((res: any) => {
            const tempTableData = [...tableData]
            setTableData(tempTableData.filter(function (data: any) {
                return selectedData.indexOf(data._id) === -1;
            }));
            handleCloseConfirmationDialog();
            setSelectedData([]);

            setSnackbarMessage("Success!");
            handleShowSuccessSnackbar();
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
        setIsLoading(false);
    }

    const columns = [
        {
            name: "_id",
            label: "ID",
            options: {
                display: false,
            }
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
        data.push({ "_id": td._id, "brand": td.brand.name, "product": td.product.name, "serialNumber": td.serialNumber, "customer": td.customer ? td.customer.name : "None", "action": td.action.name, "quantity": td.action.value, "user": td.user.name, "createdAt": format(new Date(td.createdAt), "MMM d, yyyy HH:mm:ss") })
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
        customToolbarSelect: (selectedRows: any, displayData: any, setSelectedRows: any) => <IconBtn style={{ marginRight: "24px" }} icon={DeleteIcon} tooltip={"Delete"} handleClick={() => { handleClickDeleteButton(selectedRows) }}></IconBtn>,
        downloadOptions:
        {
            filename: 'listShipment ' + dateInfo + " " + productInfo + '.csv',
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
                    height: 'calc(100vh - 270px)'
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
                            <LabelIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></LabelIcon>
                            <h2 style={{ marginTop: "0px" }}>{productInfo}</h2>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <h1 style={{ marginTop: "-5px", color: "black" }}>{"#" + tableData.length}</h1>
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
                                    <FormControlLabel
                                        style={{ height: "48px" }}
                                        control={<Checkbox checked={useDate} onChange={handleChangeUseDate} name="useDate" color="primary" />}
                                        label="Use Date"
                                    />
                                    {useDate && (
                                        <>
                                            <IconBtn icon={TodayIcon} tooltip={"Set Date"} handleClick={handleClickDateButton}></IconBtn>
                                            <TextField
                                                id="input-start-date"
                                                label="Start Date"
                                                fullWidth={true}
                                                disabled
                                                value={format(formData.startDate, "MMM d, yyyy")}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <TodayIcon></TodayIcon>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                id="input-end-date"
                                                label="End Date"
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
                                        </>
                                    )}
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
                                            <MenuItem key={LIST_DATA_TYPE.ALL} value={LIST_DATA_TYPE.ALL}>{LIST_DATA_TYPE.ALL}</MenuItem>
                                            {Object.values(brandData).map((data: any) => {
                                                return (
                                                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                        <FormHelperText>{error.brandId.status ? defaultErrorMessage : ""}</FormHelperText>
                                    </FormControl>
                                    {formData.brandId !== LIST_DATA_TYPE.ALL && (
                                        <>
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
                                        </>
                                    )}
                                    <Button type="submit" fullWidth variant="contained" size="large" color="primary">
                                        {"Search"}
                                    </Button>
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
                    <Grid container style={{ marginTop: "20px" }}>
                        <Button fullWidth variant="contained" size="large" color="primary" onClick={handleClickShipmentSummaryButton}>
                            {"Check Summary"}
                        </Button>
                    </Grid>

                    <Dialog
                        fullWidth={true}
                        open={isOpenConfirmationDialog}
                        onClose={handleCloseConfirmationDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {selectedData.length + " data selected."}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseConfirmationDialog} color="primary" autoFocus>
                                {"Cancel"}
                            </Button>
                            <Button onClick={submitDelete} color="secondary">
                                {"Delete"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={isOpenCalendar}
                        onClose={handleCloseCalendarDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DateRangePicker
                            ranges={[{
                                startDate: formData.startDate,
                                endDate: formData.endDate,
                                key: 'selection',
                            }]}
                            onChange={handleSelectDate}
                        />
                    </Dialog>

                    <ShipmentSummaryDialog setIsLoading={setIsLoading} tableData={tableData} isDialogOpen={isOpenShipmentSummaryDialog} handleCloseDialog={handleCloseShipmentSummaryDialog}></ShipmentSummaryDialog>
                </>
            )
            }
        </>
    );
}

export default ShipmentReportPage;
