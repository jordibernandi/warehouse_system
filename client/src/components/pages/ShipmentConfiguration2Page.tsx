import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../App';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

// Types
import { SHIPMENT_INVOICE_TYPE, ACTION_TYPE } from '../../types/enum';

// Services
import InvoiceService from '../../services/InvoiceService';

const ShipmentConfiguration2Page = (props: any) => {
    const {
        loginData,
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const { configData, setConfigData, error, setError, defaultErrorMessage, handleChange, locationData, actionData, customerData, initialErrorState } = props;

    const [useExistingInvoice, setUseExistingInvoice] = useState(false);
    const [existingInvoiceName, setExistingInvoiceName] = useState("");
    const [invoiceNotFound, setInvoiceNotFound] = useState(false);

    const handleChangeUseExistingInvoice = (e: any) => {
        setUseExistingInvoice(!useExistingInvoice);
        if (useExistingInvoice) {
            setConfigData({ ...configData, invoiceConfigId: SHIPMENT_INVOICE_TYPE.AUTO_GENERATED, customerConfigId: "", nameConfig: SHIPMENT_INVOICE_TYPE.AUTO_GENERATED, descriptionConfig: "" });
            setInvoiceNotFound(false);
        } else {
            setConfigData({ ...configData, invoiceConfigId: "", customerConfigId: "", nameConfig: "", descriptionConfig: "" });
            setInvoiceNotFound(false);
        }
        setError(initialErrorState);
        setExistingInvoiceName("");
    }

    const handleChangeExistingInvoiceName = (e: any) => {
        setExistingInvoiceName(e.target.value);
    }

    const handleClickSearchInvoice = async (e: any) => {
        setIsLoading(true);
        await InvoiceService.findExisting({ name: existingInvoiceName }).then((res: any) => {
            if (res.data) {
                const invoiceFound = res.data;
                setConfigData({ ...configData, invoiceConfigId: invoiceFound._id, customerConfigId: invoiceFound.customerId, nameConfig: invoiceFound.name, descriptionConfig: invoiceFound.description });
                setInvoiceNotFound(false);
                setError(initialErrorState);
            } else {
                setConfigData({ ...configData, invoiceConfigId: "", customerConfigId: "", nameConfig: "", descriptionConfig: "" });
                setInvoiceNotFound(true);
            }
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
        setIsLoading(false);
    }

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant="h6" gutterBottom>
                                {`Action: ${actionData[configData.actionConfigId].name}`} {error.actionConfigId.status && "ERROR"}
                            </Typography>
                        </Grid>
                        {configData.actionConfigId === ACTION_TYPE.CHANGE_WH ? (
                            <>
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {`Location From: ${locationData[configData.locationChangeWHFromConfigId].name}`} {error.locationChangeWHFromConfigId.status && "ERROR"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {`Location To: ${locationData[configData.locationChangeWHToConfigId].name}`} {error.locationChangeWHToConfigId.status && "ERROR"}
                                    </Typography>
                                </Grid>
                            </>
                        ) : (
                            <Grid item xs={12} sm={12}>
                                <Typography variant="h6" gutterBottom>
                                    {`Location: ${locationData[configData.locationConfigId].name}`} {error.locationConfigId.status && "ERROR"}
                                </Typography>
                            </Grid>
                        )}
                        {(configData.actionConfigId && actionData[configData.actionConfigId].withInvoice) && (
                            <>
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {`Invoice Name: ${useExistingInvoice ? (configData.invoiceConfigId ? configData.nameConfig : "-") : "Auto Generated"}`}  {error.invoiceConfigId.status && "ERROR"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {`Customer: ${configData.customerConfigId ? customerData[configData.customerConfigId].name : "-"}`} {error.customerConfigId.status && "ERROR"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {`Description: ${configData.descriptionConfig ? configData.descriptionConfig : "-"}`} {error.descriptionConfig.status && "ERROR"}
                                    </Typography>
                                </Grid>
                                {useExistingInvoice ? (
                                    <Grid item xs={12} sm={12} style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                                        <TextField
                                            variant="outlined"
                                            value={existingInvoiceName}
                                            margin="normal"
                                            id="existingInvoiceName"
                                            name="existingInvoiceName"
                                            label="Existing Invoice Name"
                                            type="text"
                                            onChange={handleChangeExistingInvoiceName}
                                            style={{ marginRight: "10px" }}
                                            error={invoiceNotFound}
                                            helperText={invoiceNotFound ? "Invoice Not Found!" : ""}
                                        />
                                        <IconButton aria-label="search" onClick={handleClickSearchInvoice}>
                                            <SearchIcon fontSize="inherit" />
                                        </IconButton>
                                    </Grid>
                                ) : (
                                    <>
                                        <Grid item xs={12} sm={12}>
                                            <FormControl style={{ width: "100%" }} required error={error.customerConfigId.status}>
                                                <InputLabel id="customer-label">{"Customer"}</InputLabel>
                                                <Select
                                                    labelId="customer-label"
                                                    id="customerConfigId"
                                                    name="customerConfigId"
                                                    value={configData.customerConfigId ? configData.customerConfigId : ""}
                                                    onChange={handleChange}
                                                    error={error.customerConfigId.status}
                                                >
                                                    {Object.values(customerData).map((data: any) => {
                                                        return (
                                                            <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                                <FormHelperText>{error.customerConfigId.status ? defaultErrorMessage : ""}</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <TextField
                                                required
                                                value={configData.descriptionConfig}
                                                margin="normal"
                                                id="descriptionConfig"
                                                name="descriptionConfig"
                                                label="Description"
                                                type="text"
                                                fullWidth
                                                onChange={handleChange}
                                                error={error.descriptionConfig.status}
                                                helperText={error.descriptionConfig.status ? defaultErrorMessage : ""}
                                            />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={12}>
                                    <FormControlLabel
                                        control={<Checkbox checked={useExistingInvoice} onChange={handleChangeUseExistingInvoice} name="useExistingInvoice" color="primary" />}
                                        label="Use Existing Invoice"
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}

export default ShipmentConfiguration2Page;
