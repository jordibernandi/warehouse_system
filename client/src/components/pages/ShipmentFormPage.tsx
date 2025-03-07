import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
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
import Typography from '@material-ui/core/Typography';

// Sound Effects
import useSound from 'use-sound';

// Layouts
import IconBtn from '../appLayout/IconBtn';
import LabelIcon from '@material-ui/icons/Label';
import InfoIcon from '@material-ui/icons/Info';
import ShipmentSummaryDialog from '../appLayout/ShipmentSummaryDialog';

// Types
import { ERROR_TYPE, SHIPMENT_INFORMATION_TYPE, ACTION_TYPE } from '../../types/enum';

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
import InvoiceService from '../../services/InvoiceService';
import UserService from '../../services/UserService';

const successSound = require('../soundEffects/successSound.mp3');
const failSound = require('../soundEffects/failSound.mp3');
const productSetSound = require('../soundEffects/productSetSound.mp3');

const ShipmentFormPage = (props: any) => {
    const {
        loginData,
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const { setConfigData, configData, locationData, actionData, customerData } = props;

    const initialErrorState = {
        _id: { type: [], status: false },
        brandId: { type: [], status: false },
        locationId: { type: [], status: false },
        locationChangeWHFromId: { type: [], status: false },
        locationChangeWHToId: { type: [], status: false },
        customerId: { type: [], status: false },
        actionId: { type: [], status: false },
        productCode: { type: [], status: false },
        invoiceId: { type: [], status: false },
        serialNumber: { type: [], status: false },
    };
    const initialFormDataState = {
        _id: uuidv4(),
        locationId: configData.locationConfigId,
        locationChangeWHFromId: configData.locationChangeWHFromConfigId,
        locationChangeWHToId: configData.locationChangeWHToConfigId,
        customerId: configData.customerConfigId,
        actionId: configData.actionConfigId,
        invoiceId: configData.invoiceConfigId,
        productCode: '',
        serialNumber: ''
    };
    const defaultErrorMessage = "Value is Empty or Invalid";

    const [playSuccess] = useSound(successSound);
    const [playFail] = useSound(failSound);
    const [playProductSet] = useSound(productSetSound);

    const [isLoaded, setIsLoaded] = useState(false);
    // const [locationData, setLocationData] = useState({} as any);
    // const [customerData, setCustomerData] = useState({} as any);
    // const [actionData, setActionData] = useState({} as any);
    const [brandData, setBrandData] = useState({} as any);
    const [productData, setProductData] = useState({} as any);
    const [productCodeData, setProductCodeData] = useState({} as any);
    const [userData, setUserData] = useState({} as any);
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
        const fetchData = async () => {
            setIsLoading(true);

            let dataProduct: any;
            let dataProductCode: any;
            let dataBrand: any;
            // let activeDataLocation: any;
            // let activeDataCustomer: any;
            // let activeDataAction: any;
            let dataUser: any;

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

            // await LocationService.getAll().then((res: any) => {
            //     activeDataLocation = FunctionUtil.getConvertArrayToAssoc(res.data);
            // }).catch((error: any) => {
            //     setSnackbarMessage(error.response.data.msg);
            //     handleShowErrorSnackbar();
            // });

            // await CustomerService.getAll().then((res: any) => {
            //     activeDataCustomer = FunctionUtil.getConvertArrayToAssoc(res.data);
            // }).catch((error: any) => {
            //     setSnackbarMessage(error.response.data.msg);
            //     handleShowErrorSnackbar();
            // });

            // await ActionService.getAll().then((res: any) => {
            //     activeDataAction = FunctionUtil.getConvertArrayToAssoc(res.data);
            // }).catch((error: any) => {
            //     setSnackbarMessage(error.response.data.msg);
            //     handleShowErrorSnackbar();
            // });

            await UserService.getAll().then((res: any) => {
                dataUser = FunctionUtil.getConvertArrayToAssoc(res.data);
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });

            if (actionData[configData.actionConfigId].withInvoice) {
                await ShipmentService.getByInvoiceId(formData).then((res: any) => {
                    let tempTableData: any[] = [];

                    res.data.forEach((shipment: any) => {
                        const productFound = dataProduct[shipment.productId];
                        const invoiceFound = (shipment.invoiceId === configData.invoiceConfigId) ? {
                            customerId: configData.customerConfigId,
                            name: configData.nameConfig,
                            description: configData.descriptionConfig,
                        } : {}
                        tempTableData.push({
                            "_id": shipment._id,
                            "invoice": invoiceFound ? invoiceFound : null,
                            "product": productFound ? productFound : null,
                            "brand": productFound ? dataBrand[productFound.brandId] : null,
                            "location": locationData[shipment.locationId],
                            "customer": invoiceFound ? customerData[invoiceFound.customerId] : null,
                            "action": actionData[shipment.actionId],
                            "serialNumber": shipment.serialNumber,
                            "user": dataUser[shipment.userId],
                            "createdAt": shipment.createdAt,
                        });
                    })
                    setTableData(tempTableData);
                }).catch((error: any) => {
                    setSnackbarMessage(error.response.data.msg);
                    handleShowErrorSnackbar();
                });
            }

            setProductData(dataProduct);
            setProductCodeData(dataProductCode);
            setBrandData(dataBrand);
            // setLocationData(activeDataLocation);
            // setCustomerData(activeDataCustomer);
            // setActionData(activeDataAction);
            setUserData(dataUser);
            setIsLoaded(true);
            setIsLoading(false);
        }

        fetchData();
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

    const handleCloseShipmentSummaryDialog = useCallback(() => {
        setIsOpenShipmentSummaryDialog(false);
    }, [])

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
            tempSelectedData.push(tableData[sr.dataIndex]);
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
        let isValid = true;
        const tempError = { ...error };

        Object.keys(formData).forEach((key: any) => {
            if (formData[key].toString().trim() === "" && error[key].type.includes(ERROR_TYPE.REQUIRED)) {
                // if ((key === "invoiceId") && !actionData[formData.actionId].withInvoice) {
                // } else {
                tempError[key] = {
                    ...tempError[key],
                    status: true
                }
                isValid = false;
                // }
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

        // Set Product Code
        if (Object.values(productCodeData).filter(FunctionUtil.activeFilterFunction).some((data: any) => data.code === formData.serialNumber)) {
            setFormData({ ...formData, _id: initialFormDataState._id, productCode: formData.serialNumber, serialNumber: initialFormDataState.serialNumber });
            setIsSubmit(true);
            setShipmentStatus(SHIPMENT_INFORMATION_TYPE.SET_PRODUCT_SUCCESS);
            setIsLoading(false);
            playProductSet();
            return;
        } else {
            if (Object.values(productCodeData).filter(FunctionUtil.activeFilterFunction).some((data: any) => data.code === formData.productCode)) {
                // Valid data
                const productFound = productCodeData[formData.productCode];
                const invoiceFound = (configData.invoiceConfigId && formData.invoiceId === configData.invoiceConfigId) ? {
                    customerId: configData.customerConfigId,
                    name: configData.nameConfig,
                    description: configData.descriptionConfig,
                } : {};

                if (formData.actionId === ACTION_TYPE.CHANGE_WH) {
                    const changeWHDataIdFrom = uuidv4();
                    const changeWHDataIdTo = uuidv4();

                    const newTableDataFrom = {
                        "_id": changeWHDataIdFrom,
                        "product": productData[productFound._id],
                        "brand": brandData[productFound.brandId],
                        "location": locationData[formData.locationChangeWHFromId],
                        "customer": customerData[invoiceFound.customerId],
                        "action": actionData[ACTION_TYPE.CHANGE_WH_FROM],
                        "invoice": invoiceFound,
                        "serialNumber": formData.serialNumber,
                        "user": loginData,
                        "createdAt": new Date()
                    };

                    const newTableDataTo = {
                        "_id": changeWHDataIdTo,
                        "product": productData[productFound._id],
                        "brand": brandData[productFound.brandId],
                        "location": locationData[formData.locationChangeWHToId],
                        "customer": customerData[invoiceFound.customerId],
                        "action": actionData[ACTION_TYPE.CHANGE_WH_TO],
                        "invoice": invoiceFound,
                        "serialNumber": formData.serialNumber,
                        "user": loginData,
                        "createdAt": new Date()
                    };

                    const newShipmentData = {
                        "changeWHDataIdFrom": changeWHDataIdFrom,
                        "changeWHDataIdTo": changeWHDataIdTo,
                        "productId": productFound._id,
                        "locationChangeWHFromId": formData.locationChangeWHFromId,
                        "locationChangeWHToId": formData.locationChangeWHToId,
                        "actionId": formData.actionId,
                        "invoiceId": formData.invoiceId,
                        "serialNumber": formData.serialNumber,
                        "userId": loginData._id,
                    }

                    ShipmentService.addChangeWH(newShipmentData).then((res: any) => {
                        if (res.data.success) {
                            const newTableData = [...tableData];
                            newTableData.push(newTableDataFrom);
                            newTableData.push(newTableDataTo);
                            setTableData(newTableData);
                            setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                            setIsSubmit(true);
                            setShipmentStatus(SHIPMENT_INFORMATION_TYPE.ADD_SERIAL_NUMBER);

                            setSnackbarMessage("Success!");
                            handleShowSuccessSnackbar();
                            playSuccess();
                        } else {
                            setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                            setIsSubmit(true);
                            if (res.data.cause === "errorDuplicateChangeWHFrom") {
                                setShipmentStatus(SHIPMENT_INFORMATION_TYPE.DUPLICATE_DATA_CHANGE_WH_FROM);
                            } else if (res.data.cause === "errorDuplicateChangeWHTo") {
                                setShipmentStatus(SHIPMENT_INFORMATION_TYPE.DUPLICATE_DATA_CHANGE_WH_TO);
                            }

                            setSnackbarMessage("Something went wrong!");
                            handleShowErrorSnackbar();
                            playFail();
                        }
                    }).catch((error: any) => {
                        setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                        setIsSubmit(true);
                        setShipmentStatus(SHIPMENT_INFORMATION_TYPE.SOMETHING_ERROR);

                        setSnackbarMessage(error.response.data.msg);
                        handleShowErrorSnackbar();
                        setIsLoading(false);
                        playFail();
                    });
                } else {
                    const newTableData = {
                        "_id": formData._id,
                        "product": productData[productFound._id],
                        "brand": brandData[productFound.brandId],
                        "location": locationData[formData.locationId],
                        "customer": customerData[invoiceFound.customerId],
                        "action": actionData[formData.actionId],
                        "invoice": invoiceFound,
                        "serialNumber": formData.serialNumber,
                        "user": loginData,
                        "createdAt": new Date()
                    };

                    const newShipmentData = {
                        "_id": formData._id,
                        "productId": productFound._id,
                        "locationId": formData.locationId,
                        "actionId": formData.actionId,
                        "invoiceId": formData.invoiceId,
                        "serialNumber": formData.serialNumber,
                        "userId": loginData._id,
                    }

                    ShipmentService.add(newShipmentData).then((res: any) => {
                        if (res.data.success) {
                            setTableData([...tableData, newTableData]);
                            setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                            setIsSubmit(true);
                            setShipmentStatus(SHIPMENT_INFORMATION_TYPE.ADD_SERIAL_NUMBER);

                            setSnackbarMessage("Success!");
                            handleShowSuccessSnackbar();
                            playSuccess();
                        } else {
                            setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                            setIsSubmit(true);
                            if (res.data.cause === "errorDuplicate") {
                                setShipmentStatus(SHIPMENT_INFORMATION_TYPE.DUPLICATE_DATA);
                            }

                            setSnackbarMessage("Something went wrong!");
                            handleShowErrorSnackbar();
                            playFail();
                        }
                    }).catch((error: any) => {
                        setFormData({ ...formData, _id: initialFormDataState._id, serialNumber: initialFormDataState.serialNumber });
                        setIsSubmit(true);
                        setShipmentStatus(SHIPMENT_INFORMATION_TYPE.SOMETHING_ERROR);

                        setSnackbarMessage(error.response.data.msg);
                        handleShowErrorSnackbar();
                        setIsLoading(false);
                        playFail();
                    });
                }
            } else {
                setFormData({ ...formData, _id: initialFormDataState._id, productCode: formData.serialNumber, serialNumber: initialFormDataState.serialNumber });
                setIsSubmit(true);
                setShipmentStatus(SHIPMENT_INFORMATION_TYPE.SET_PRODUCT_FAIL);
                setIsLoading(false);
                playFail();
                return;
            }
        }
        setIsLoading(false);
    };

    const submitDelete = async (e: any) => {
        e.preventDefault();

        setIsLoading(true);

        await ShipmentService.delete({ selectedData: selectedData }).then((res: any) => {
            const tempTableData = [...tableData]
            setTableData(tempTableData.filter(function (data: any) {
                return selectedData.findIndex(sd => sd._id === data._id) === -1;
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
            name: "invoice", label: "Invoice"
        },
        {
            name: "description", label: "Description"
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
            name: "createdAt", label: "Created At", options: { sortDirection: 'desc' }
        },
    ] as any;

    let data: any[] = [];
    tableData.forEach((td: any) => {
        data.push({ "_id": td._id, "invoice": Object.values(td.invoice).length > 0 ? td.invoice.name : "-", "description": Object.values(td.invoice).length > 0 ? td.invoice.description : "-", "brand": td.brand.name, "product": td.product.name, "serialNumber": td.serialNumber, "customer": td.customer ? td.customer.name : "-", "action": td.action.name, "location": td.location.name, "quantity": td.action.value, "user": td.user.name, "createdAt": format(new Date(td.createdAt), "MMM d, yyyy HH:mm:ss") })
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
                            {Object.values(productCodeData).filter(FunctionUtil.activeFilterFunction).some((data: any) => data.code === formData.productCode) ?
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
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} sm={12}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={12}>
                                                    <Typography style={{ margin: "0px" }} variant="body1" display="block" gutterBottom>
                                                        {"Action"}
                                                    </Typography>
                                                    <Typography variant="caption" gutterBottom>
                                                        {formData.actionId ? actionData[formData.actionId].name : ""}
                                                    </Typography>
                                                    {error.actionId.status ? defaultErrorMessage : ""}
                                                </Grid>
                                                {configData.actionConfigId === ACTION_TYPE.CHANGE_WH ? (
                                                    <>
                                                        <Grid item xs={12} sm={12}>
                                                            <Typography style={{ margin: "0px" }} variant="body1" display="block" gutterBottom>
                                                                {"Location From"}
                                                            </Typography>
                                                            <Typography variant="caption" gutterBottom>
                                                                {formData.locationChangeWHFromId ? locationData[formData.locationChangeWHFromId].name : ""}
                                                            </Typography>
                                                            {error.locationChangeWHFromId.status ? defaultErrorMessage : ""}
                                                        </Grid>
                                                        <Grid item xs={12} sm={12}>
                                                            <Typography style={{ margin: "0px" }} variant="body1" display="block" gutterBottom>
                                                                {"Location To"}
                                                            </Typography>
                                                            <Typography variant="caption" gutterBottom>
                                                                {formData.locationChangeWHToId ? locationData[formData.locationChangeWHToId].name : ""}
                                                            </Typography>
                                                            {error.locationChangeWHToId.status ? defaultErrorMessage : ""}
                                                        </Grid>
                                                    </>
                                                ) : (
                                                    <Grid item xs={12} sm={12}>
                                                        <Typography style={{ margin: "0px" }} variant="body1" display="block" gutterBottom>
                                                            {"Location"}
                                                        </Typography>
                                                        <Typography variant="caption" gutterBottom>
                                                            {formData.locationId ? locationData[formData.locationId].name : ""}
                                                        </Typography>
                                                        {error.locationId.status ? defaultErrorMessage : ""}
                                                    </Grid>
                                                )}
                                                {(formData.actionId && actionData[formData.actionId].withInvoice) && (
                                                    <>
                                                        <Grid item xs={12} sm={12}>
                                                            <Typography style={{ margin: "0px" }} variant="body1" display="block" gutterBottom>
                                                                {"Invoice"}
                                                            </Typography>
                                                            <Typography variant="caption" gutterBottom>
                                                                {configData.nameConfig ? configData.nameConfig : ""}
                                                            </Typography>
                                                            {error.invoiceId.status ? defaultErrorMessage : ""}
                                                        </Grid>
                                                        <Grid item xs={12} sm={12}>
                                                            <Typography style={{ margin: "0px" }} variant="body1" display="block" gutterBottom>
                                                                {"Description"}
                                                            </Typography>
                                                            <Typography variant="caption" gutterBottom>
                                                                {configData.descriptionConfig ? configData.descriptionConfig : ""}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={12}>
                                                            <Typography style={{ margin: "0px" }} variant="body1" display="block" gutterBottom>
                                                                {"Customer"}
                                                            </Typography>
                                                            <Typography variant="caption" gutterBottom>
                                                                {configData.customerConfigId ? customerData[configData.customerConfigId].name : ""}
                                                            </Typography>
                                                        </Grid>
                                                    </>
                                                )}
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
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
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <TextField
                                                inputRef={inputSerialNumber}
                                                key={formData.serialNumber}
                                                defaultValue={formData.serialNumber || ""}
                                                margin="normal"
                                                id="serialNumber"
                                                name="serialNumber"
                                                label="Scan/Input Code Here!"
                                                type="text"
                                                variant="filled"
                                                fullWidth
                                                onBlur={handleChange}
                                                required
                                                error={error.serialNumber.status}
                                                helperText={error.serialNumber.status ? defaultErrorMessage : ""}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <Button type="submit" fullWidth variant="contained" size="large" color="primary">
                                                {"Submit"}
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
                    <Grid container style={{ marginTop: "20px" }} spacing={3}>
                        <Grid item xs={12} sm={3}>
                            <Button fullWidth variant="contained" size="large" color="primary" onClick={() => { window.location.reload() }}>
                                {"New Shipment"}
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={9}>
                            <Button fullWidth variant="contained" size="large" color="primary" onClick={handleClickShipmentSummaryButton}>
                                {"Check Summary"}
                            </Button>
                        </Grid>
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

export default ShipmentFormPage;
