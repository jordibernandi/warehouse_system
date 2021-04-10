import React, { useState, useEffect, useRef, useContext } from 'react';
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { v4 as uuidv4 } from 'uuid';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

// Types
import { ACTION_TYPE, ERROR_TYPE, SHIPMENT_INVOICE_TYPE } from '../../types/enum';

// Pages
import ShipmentConfiguration1Page from './ShipmentConfiguration1Page';
import ShipmentConfiguration2Page from './ShipmentConfiguration2Page';
import ShipmentFormPage from './ShipmentFormPage';

// Utils
import FunctionUtil from '../../utils/FunctionUtil';

// Constants
import { getShipmentInformation } from '../../types/constants'

// Services
import ProductService from '../../services/ProductService';
import BrandService from '../../services/BrandService';
import LocationService from '../../services/LocationService';
import ShipmentService from '../../services/ShipmentService';
import CustomerService from '../../services/CustomerService';
import ActionService from '../../services/ActionService';
import InvoiceService from '../../services/InvoiceService';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        height: 'calc(100vh - 185px)',
        overflow: 'scroll'
    },
    stepper: {
        padding: theme.spacing(3, 0, 5),
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    button: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(1),
    },
}));

const steps = ['Configuration 1', 'Configuration 2'];

const ShipmentPage = (props: any) => {
    const {
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const classes = useStyles();

    const [activeStep, setActiveStep] = useState(0);

    const initialErrorState = {
        locationConfigId: { type: [ERROR_TYPE.REQUIRED], status: false },
        locationChangeWHFromConfigId: { type: [ERROR_TYPE.REQUIRED], status: false },
        locationChangeWHToConfigId: { type: [ERROR_TYPE.REQUIRED], status: false },
        actionConfigId: { type: [ERROR_TYPE.REQUIRED], status: false },
        invoiceConfigId: { type: [ERROR_TYPE.REQUIRED], status: false },
        customerConfigId: { type: [ERROR_TYPE.REQUIRED], status: false },
        nameConfig: { type: [ERROR_TYPE.REQUIRED], status: false },
        descriptionConfig: { type: [ERROR_TYPE.REQUIRED], status: false },
    };
    const initialConfigDataState = {
        locationConfigId: '',
        locationChangeWHFromConfigId: '',
        locationChangeWHToConfigId: '',
        actionConfigId: '',
        invoiceConfigId: SHIPMENT_INVOICE_TYPE.AUTO_GENERATED,
        customerConfigId: '',
        nameConfig: SHIPMENT_INVOICE_TYPE.AUTO_GENERATED,
        descriptionConfig: '',
    };
    const defaultErrorMessage = "Value is Empty or Invalid";

    const [configData, setConfigData] = useState(initialConfigDataState as any);
    const [error, setError] = useState(initialErrorState as any);

    const [isLoaded, setIsLoaded] = useState(false);

    const [locationData, setLocationData] = useState({} as any);
    const [customerData, setCustomerData] = useState({} as any);
    const [actionData, setActionData] = useState({} as any);
    const [brandData, setBrandData] = useState({} as any);
    const [productData, setProductData] = useState({} as any);
    const [productCodeData, setProductCodeData] = useState({} as any);

    const handleNext = () => {
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handleChange = (e: any) => {
        if (e.target.name === "actionConfigId") {
            setConfigData({ ...configData, [e.target.name]: e.target.value, "invoiceConfigId": SHIPMENT_INVOICE_TYPE.AUTO_GENERATED, "customerConfigId": "", "nameConfig": SHIPMENT_INVOICE_TYPE.AUTO_GENERATED, "descriptionConfig": "" })
        } else {
            setConfigData({ ...configData, [e.target.name]: e.target.value })
        }

        if (e.target.value === "") {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: true } })
        } else {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: false } })
        }
    }


    const getStepContent = (step: any) => {
        switch (step) {
            case 0:
                return <ShipmentConfiguration1Page
                    configData={configData}
                    setConfigData={setConfigData}
                    error={error}
                    setError={setError}
                    defaultErrorMessage={defaultErrorMessage}
                    handleChange={handleChange}
                    actionData={actionData}
                    locationData={locationData}
                    initialErrorState={initialErrorState}
                />;
            case 1:
                return <ShipmentConfiguration2Page
                    configData={configData}
                    setConfigData={setConfigData}
                    error={error}
                    setError={setError}
                    defaultErrorMessage={defaultErrorMessage}
                    handleChange={handleChange}
                    actionData={actionData}
                    locationData={locationData}
                    customerData={customerData}
                    initialErrorState={initialErrorState}
                />;
            default:
                throw new Error('Unknown step');
        }
    }

    const submitNext = async () => {
        let isValid = true;
        const tempError = { ...error };

        Object.keys(configData).forEach((key: any) => {
            if (configData[key].toString().trim() === "" && error[key].type.includes(ERROR_TYPE.REQUIRED)) {
                if (activeStep === 0 && (
                    key === "invoiceConfigId" ||
                    key === "customerConfigId" ||
                    key === "nameConfig" ||
                    key === "descriptionConfig" ||
                    (key === "locationConfigId" && configData["actionConfigId"] && (configData["actionConfigId"] === ACTION_TYPE.CHANGE_WH)) ||
                    ((key === "locationChangeWHFromConfigId" || key === "locationChangeWHToConfigId") && (configData["actionConfigId"] !== ACTION_TYPE.CHANGE_WH))
                )) {
                    // Pass                    
                } else if (activeStep === 1 && (
                    ((key === "invoiceConfigId" || key === "customerConfigId" || key === "nameConfig" || key === "descriptionConfig") && !actionData[configData.actionConfigId].withInvoice) ||
                    (key === "locationConfigId" && configData["actionConfigId"] && (configData["actionConfigId"] === ACTION_TYPE.CHANGE_WH)) ||
                    ((key === "locationChangeWHFromConfigId" || key === "locationChangeWHToConfigId") && (configData["actionConfigId"] !== ACTION_TYPE.CHANGE_WH))
                )) {
                    // Pass
                } else {
                    tempError[key] = {
                        ...tempError[key],
                        status: true
                    }
                    isValid = false;
                }
            }
        })

        setError(tempError);

        if (!isValid) {
            return;
        } else {
            // Generate invoice after 2nd config
            if (activeStep === steps.length - 1) {
                if (actionData[configData.actionConfigId].withInvoice) {
                    if (configData.invoiceConfigId === SHIPMENT_INVOICE_TYPE.AUTO_GENERATED) {
                        await InvoiceService.generate({ _id: uuidv4(), customerId: configData.customerConfigId, description: configData.descriptionConfig }).then((res: any) => {
                            setConfigData({ ...configData, invoiceConfigId: res.data.value._id, nameConfig: res.data.value.name });
                        }).catch((error: any) => {
                            setSnackbarMessage(error.response.data.msg);
                            handleShowErrorSnackbar();
                        });
                    }
                } else {
                    setConfigData({ ...configData, invoiceConfigId: "", nameConfig: "" });
                }
            }
            handleNext();
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            let activeDataProduct: any;
            let activeDataProductCode: any;
            let activeDataBrand: any;
            let activeDataLocation: any;
            let activeDataCustomer: any;
            let activeDataAction: any;

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
            setIsLoaded(true);
            setIsLoading(false);
        }

        fetchData();
    }, []);

    return (
        <> {isLoaded && (
            <>
                { activeStep === steps.length ? (
                    <ShipmentFormPage
                        configData={configData}
                        setConfigData={setConfigData}
                        actionData={actionData}
                        locationData={locationData}
                        customerData={customerData}
                    />
                ) : (
                    <Grid container>
                        <Grid item xs={12} sm={12}>
                            <Paper className={classes.paper}>
                                <Typography component="h1" variant="h4" align="center">
                                    {"Shipment Configuration"}
                                </Typography>
                                <Stepper activeStep={activeStep} className={classes.stepper}>
                                    {steps.map((label) => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                                <>
                                    {getStepContent(activeStep)}
                                    <div className={classes.buttons}>
                                        {activeStep !== 0 && (
                                            <Button onClick={handleBack} className={classes.button}>
                                                {"Back"}
                                            </Button>
                                        )}
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={submitNext}
                                            className={classes.button}
                                        >
                                            {activeStep === steps.length - 1 ? 'Start Scanning' : 'Next'}
                                        </Button>
                                    </div>
                                </>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </>)}
        </>
    );
}

export default ShipmentPage;
