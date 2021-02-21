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

// Types
import { ERROR_TYPE, SHIPMENT_INFORMATION_TYPE } from '../../types/enum';

// Utils
import FunctionUtil from '../../utils/FunctionUtil';

// Services
import LocationService from '../../services/LocationService';
import CustomerService from '../../services/CustomerService';
import ActionService from '../../services/ActionService';

const ShipmentConfiguration1Page = (props: any) => {
    const {
        loginData,
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const { configData, error, defaultErrorMessage, handleChange, locationData, actionData, } = props;

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <FormControl style={{ width: "100%" }} required error={error.actionConfigId.status}>
                                <InputLabel id="action-label">{"Action"}</InputLabel>
                                <Select
                                    labelId="action-label"
                                    id="actionConfigId"
                                    name="actionConfigId"
                                    value={configData.actionConfigId ? configData.actionConfigId : ""}
                                    onChange={handleChange}
                                    error={error.actionConfigId.status}
                                >
                                    {Object.values(actionData).map((data: any) => {
                                        return (
                                            <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                        )
                                    })}
                                    <MenuItem key={"CHANGE_WH"} value={"CHANGE_WH"}>{"Pindah Gudang"}</MenuItem>
                                </Select>
                                <FormHelperText>{error.actionConfigId.status ? defaultErrorMessage : ""}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl style={{ width: "100%" }} required error={error.locationConfigId.status}>
                                <InputLabel id="location-label">{"Location"}</InputLabel>
                                <Select
                                    labelId="location-label"
                                    id="locationConfigId"
                                    name="locationConfigId"
                                    value={configData.locationConfigId ? configData.locationConfigId : ""}
                                    onChange={handleChange}
                                    error={error.locationConfigId.status}
                                >
                                    {Object.values(locationData).map((data: any) => {
                                        return (
                                            <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                        )
                                    })}
                                </Select>
                                <FormHelperText>{error.locationConfigId.status ? defaultErrorMessage : ""}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={6}>
                            <FormControl style={{ width: "100%" }} required error={error.locationConfigId.status}>
                                <InputLabel id="location-label">{"Location"}</InputLabel>
                                <Select
                                    labelId="location-label"
                                    id="locationConfigId"
                                    name="locationConfigId"
                                    value={configData.locationConfigId ? configData.locationConfigId : ""}
                                    onChange={handleChange}
                                    error={error.locationConfigId.status}
                                >
                                    {Object.values(locationData).map((data: any) => {
                                        return (
                                            <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                        )
                                    })}
                                </Select>
                                <FormHelperText>{error.locationConfigId.status ? defaultErrorMessage : ""}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={6}>
                            <FormControl style={{ width: "100%" }} required error={error.locationConfigId.status}>
                                <InputLabel id="location-label">{"Location"}</InputLabel>
                                <Select
                                    labelId="location-label"
                                    id="locationConfigId"
                                    name="locationConfigId"
                                    value={configData.locationConfigId ? configData.locationConfigId : ""}
                                    onChange={handleChange}
                                    error={error.locationConfigId.status}
                                >
                                    {Object.values(locationData).map((data: any) => {
                                        return (
                                            <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                        )
                                    })}
                                </Select>
                                <FormHelperText>{error.locationConfigId.status ? defaultErrorMessage : ""}</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}

export default ShipmentConfiguration1Page;
