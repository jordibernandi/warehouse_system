import React, { useState, useEffect, useRef, useContext } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfDay, endOfDay } from 'date-fns';

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

// Layouts
import IconBtn from '../appLayout/IconBtn';
import LabelIcon from '@material-ui/icons/Label';
import InfoIcon from '@material-ui/icons/Info';
import ShipmentSummaryDialog from '../appLayout/ShipmentSummaryDialog';

// Types
import { ERROR_TYPE, SHIPMENT_INFORMATION_TYPE } from '../../types/enum';

// Constants
import { getShipmentInformation } from '../../types/constants'

// Utils
import FunctionUtil from '../../utils/FunctionUtil';

// Services
import ProductService from '../../services/ProductService';
import BrandService from '../../services/BrandService';
import LocationService from '../../services/LocationService';
import ShipmentService from '../../services/ShipmentService';
import CustomerService from '../../services/CustomerService';
import ActionService from '../../services/ActionService';

const ShipmentPage = (props: any) => {
    const {
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const {
        userData
    } = useContext(AppContext)

    const initialErrorState = {
        _id: { type: [], status: false },
        brandId: { type: [ERROR_TYPE.REQUIRED], status: false },
        locationId: { type: [ERROR_TYPE.REQUIRED], status: false },
        customerId: { type: [], status: false },
        actionId: { type: [ERROR_TYPE.REQUIRED], status: false },
        productCode: { type: [], status: false },
        serialNumber: { type: [ERROR_TYPE.REQUIRED], status: false },
    };
    const initialFormDataState = { _id: uuidv4(), locationId: '', customerId: '', actionId: '', productCode: '', serialNumber: '' };
    const defaultErrorMessage = "Value is Empty or Invalid";

    const [isLoaded, setIsLoaded] = useState(false);
    const [locationData, setLocationData] = useState({} as any);
    const [customerData, setCustomerData] = useState({} as any);
    const [actionData, setActionData] = useState({} as any);
    const [brandData, setBrandData] = useState({} as any);
    const [productData, setProductData] = useState({} as any);
    const [productCodeData, setProductCodeData] = useState({} as any);
    const [tableData, setTableData] = useState([] as any);
    const [isOpenConfirmationDialog, setIsOpenConfirmationDialog] = useState(false);
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);
    const [selectedData, setSelectedData] = useState([] as any[]);
    const [shipmentStatus, setShipmentStatus] = useState("...");
    const [isOpenShipmentSummaryDialog, setIsOpenShipmentSummaryDialog] = useState(false);

    const [isBlured, setIsBlured] = useState(false);
    const [isPreSubmit, setIsPreSubmit] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);

    const inputSerialNumber = useRef(null as any);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            let activeDataProduct: any;
            let activeDataProductCode: any;
            let activeDataBrand: any;
            let activeDataLocation: any;
            let activeDataCustomer: any;
            let activeDataAction: any;

            await ProductService.getAll().then((res: any) => {
                activeDataProduct = FunctionUtil.getConvertArrayToAssoc(res.data);
                activeDataProductCode = FunctionUtil.getConvertArrayToAssoc(res.data, "code");
            })

            await BrandService.getAll().then((res: any) => {
                activeDataBrand = FunctionUtil.getConvertArrayToAssoc(res.data);
            })

            await LocationService.getAll().then((res: any) => {
                activeDataLocation = FunctionUtil.getConvertArrayToAssoc(res.data);
            })

            await CustomerService.getAll().then((res: any) => {
                activeDataCustomer = FunctionUtil.getConvertArrayToAssoc(res.data);
            })

            await ActionService.getAll().then((res: any) => {
                activeDataAction = FunctionUtil.getConvertArrayToAssoc(res.data);
            })

            setProductData(activeDataProduct);
            setProductCodeData(activeDataProductCode);
            setBrandData(activeDataBrand);
            setLocationData(activeDataLocation);
            setCustomerData(activeDataCustomer);
            setActionData(activeDataAction);
            setIsLoaded(true);
        }

        fetchData();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isBlured && isPreSubmit) {
            submit();
            setIsPreSubmit(false);
        }
    }, [isBlured, isPreSubmit]);

    useEffect(() => {
        if (isSubmit) {
            if (inputSerialNumber) {
                inputSerialNumber.current.focus();
                setIsBlured(false);
                setIsSubmit(false);
            }
        }
    }, [formData, isSubmit]);

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

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })

        if (e.target.value === "") {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: true } })
        } else {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: false } })
        }

        if (e.target.name === "serialNumber") {
            setIsBlured(true);
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

    const preSubmit = (e: any) => {
        e.preventDefault();

        if (inputSerialNumber) {
            inputSerialNumber.current.blur();
        }
        setIsPreSubmit(true);
    }

    const submit = async () => {
        setIsLoading(true);

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
        }

        if (productCodeData[formData.serialNumber]) {
            setFormData({ ...formData, _id: initialFormDataState._id, productCode: formData.serialNumber, serialNumber: initialFormDataState.serialNumber });
            setIsSubmit(true);
            setShipmentStatus(SHIPMENT_INFORMATION_TYPE.SET_PRODUCT_SUCCESS);
            return;
        } else {
            if (productCodeData[formData.productCode]) {
                // Valid data
                const productFound = productCodeData[formData.productCode];
                const newTableData = {
                    "_id": formData._id,
                    "product": productData[productFound._id],
                    "brand": brandData[productFound.brandId],
                    "location": locationData[formData.locationId],
                    "customer": customerData[formData.customerId],
                    "action": actionData[formData.actionId],
                    "serialNumber": formData.serialNumber,
                    "user": userData,
                    "createdAt": new Date()
                };
                const newShipmentData = {
                    "_id": formData._id,
                    "productId": productFound._id,
                    "locationId": formData.locationId,
                    "customerId": formData.customerId,
                    "actionId": formData.actionId,
                    "checkFirst": actionData[formData.actionId].checkFirst,
                    "serialNumber": formData.serialNumber,
                    "userId": userData._id,
                };

                ShipmentService.add(newShipmentData).then((res: any) => {
                    if (res.status === 200) {
                        if (res.data.success) {
                            setTableData([...tableData, newTableData]);
                            setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                            setIsSubmit(true);
                            setShipmentStatus(SHIPMENT_INFORMATION_TYPE.ADD_SERIAL_NUMBER);

                            setSnackbarMessage("Success!");
                            handleShowSuccessSnackbar();
                        } else {
                            setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                            setIsSubmit(true);
                            if (res.data.cause === "errorDuplicate") {
                                setShipmentStatus(SHIPMENT_INFORMATION_TYPE.DUPLICATE_DATA);
                            } else if (res.data.cause === "errorCheckFirst") {
                                setShipmentStatus(SHIPMENT_INFORMATION_TYPE.CHECK_FIRST_ERROR);
                            }

                            setSnackbarMessage("Something went wrong!");
                            handleShowErrorSnackbar();
                        }
                    } else {
                        setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                        setIsSubmit(true);
                        setShipmentStatus(SHIPMENT_INFORMATION_TYPE.SOMETHING_ERROR);

                        setSnackbarMessage("Something went wrong!");
                        handleShowErrorSnackbar();
                    }
                })
            } else {
                setFormData({ ...formData, _id: initialFormDataState._id, productCode: formData.serialNumber, serialNumber: initialFormDataState.serialNumber });
                setIsSubmit(true);
                setShipmentStatus(SHIPMENT_INFORMATION_TYPE.SET_PRODUCT_FAIL);
                return;
            }
        }
        setIsLoading(false);
    };

    const submitDelete = async (e: any) => {
        e.preventDefault();

        setIsLoading(true);

        ShipmentService.delete({ selectedData: selectedData }).then((res: any) => {
            if (res.status === 200) {
                const tempTableData = [...tableData]
                setTableData(tempTableData.filter(function (data: any) {
                    return selectedData.indexOf(data._id) === -1;
                }));
                handleCloseConfirmationDialog();
                setSelectedData([]);

                setSnackbarMessage("Success!");
                handleShowSuccessSnackbar();
            } else {
                setSnackbarMessage("Something went wrong!");
                handleShowErrorSnackbar();
            }
        })
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
            name: "createdAt", label: "Created At", options: { sortDirection: 'desc' }
        },
    ] as any;

    let data: any[] = [];
    tableData.forEach((td: any) => {
        data.push({ "_id": td._id, "brand": td.brand.name, "product": td.product.name, "serialNumber": td.serialNumber, "customer": td.customer ? td.customer.name : "None", "action": td.action.name, "quantity": td.action.value, "user": td.user.name, "createdAt": format(new Date(td.createdAt), "MMM d, yyyy HH:mm:ss") })
    })

    const options = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        customToolbarSelect: (selectedRows: any, displayData: any, setSelectedRows: any) => <IconBtn style={{ marginRight: "24px" }} icon={DeleteIcon} tooltip={"Delete"} handleClick={() => { handleClickDeleteButton(selectedRows) }}></IconBtn>,
        downloadOptions:
        {
            filename: 'listShipment.csv',
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
                            <LabelIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></LabelIcon>
                            {productCodeData[formData.productCode] ?
                                (
                                    <h2 style={{ marginTop: "0px", color: "green" }}>{brandData[productCodeData[formData.productCode].brandId].name} - {productCodeData[formData.productCode].name}</h2>
                                ) : (
                                    <h2 style={{ marginTop: "0px", color: "red" }}>{"No product found..."}</h2>
                                )}
                        </Grid>
                        <Grid item xs={12} sm={5} style={{ paddingLeft: "40px", position: "relative" }}>
                            <InfoIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></InfoIcon>
                            <h2 style={{ marginTop: "0px", color: getShipmentInformation(shipmentStatus).fontColor as any }}>{getShipmentInformation(shipmentStatus).message}</h2>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <h1 style={{ marginTop: "-5px", color: "black" }}>{"#" + tableData.length}</h1>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={3}>
                            <Paper style={{ height: '100%', padding: '20px' }}>
                                <form
                                    onSubmit={preSubmit}
                                    autoComplete="off"
                                    noValidate
                                >
                                    <FormControl style={{ width: "100%" }} required error={error.locationId.status}>
                                        <InputLabel id="location-label">{"Location"}</InputLabel>
                                        <Select
                                            labelId="location-label"
                                            id="locationId"
                                            name="locationId"
                                            value={formData.locationId ? formData.locationId : ""}
                                            onChange={handleChange}
                                            error={error.locationId.status}
                                        >
                                            {Object.values(locationData).map((data: any) => {
                                                return (
                                                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                        <FormHelperText>{error.locationId.status ? defaultErrorMessage : ""}</FormHelperText>
                                    </FormControl>
                                    <FormControl style={{ width: "100%" }} required error={error.actionId.status}>
                                        <InputLabel id="action-label">{"Action"}</InputLabel>
                                        <Select
                                            labelId="action-label"
                                            id="actionId"
                                            name="actionId"
                                            value={formData.actionId ? formData.actionId : ""}
                                            onChange={handleChange}
                                            error={error.actionId.status}
                                        >
                                            {Object.values(actionData).map((data: any) => {
                                                return (
                                                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                        <FormHelperText>{error.actionId.status ? defaultErrorMessage : ""}</FormHelperText>
                                    </FormControl>
                                    <FormControl style={{ width: "100%" }} error={error.customerId.status}>
                                        <InputLabel id="customer-label">{"Customer"}</InputLabel>
                                        <Select
                                            labelId="customer-label"
                                            id="customerId"
                                            name="customerId"
                                            value={formData.customerId ? formData.customerId : ""}
                                            onChange={handleChange}
                                            error={error.customerId.status}
                                        >
                                            {Object.values(customerData).map((data: any) => {
                                                return (
                                                    <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                        <FormHelperText>{error.customerId.status ? defaultErrorMessage : ""}</FormHelperText>
                                    </FormControl>
                                    <TextField
                                        value={formData.productCode}
                                        margin="normal"
                                        id="productCode"
                                        name="productCode"
                                        label="Product Code"
                                        type="text"
                                        fullWidth
                                        onChange={handleChange}
                                        error={error.productCode.status}
                                        helperText={error.productCode.status ? defaultErrorMessage : ""}
                                    />
                                    <TextField
                                        inputRef={inputSerialNumber}
                                        key={formData.serialNumber}
                                        defaultValue={formData.serialNumber || ""}
                                        margin="normal"
                                        id="serialNumber"
                                        name="serialNumber"
                                        label="Serial Number"
                                        type="text"
                                        variant="filled"
                                        fullWidth
                                        onBlur={handleChange}
                                        required
                                        error={error.serialNumber.status}
                                        helperText={error.serialNumber.status ? defaultErrorMessage : ""}
                                    />
                                    <Button type="submit" fullWidth variant="contained" size="large" color="primary">
                                        {"Submit"}
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

                    <ShipmentSummaryDialog setIsLoading={setIsLoading} tableData={tableData} isDialogOpen={isOpenShipmentSummaryDialog} handleCloseDialog={handleCloseShipmentSummaryDialog}></ShipmentSummaryDialog>
                </>
            )
            }
        </>
    );
}

export default ShipmentPage;
