import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { makeStyles } from '@material-ui/core/styles';
import MUIDataTable from 'mui-datatables';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import DoneAll from "@material-ui/icons/DoneAll";
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CSVReader from "react-csv-reader";

// Layouts
import IconBtn from '../appLayout/IconBtn';

// Types
import { DATA_MODEL_TYPE, DATA_MAPPING_VALUE_TYPE } from '../../types/enum';

// Utils
import FunctionUtil from '../../utils/FunctionUtil';

// Services
import BrandService from '../../services/BrandService';

interface ICsvUploadDialog {
    setIsLoading: any,
    isDialogOpen: boolean,
    handleCloseDialog: any,
    title: string,
    dataModel: any,
    handleSaveUpload: any
}

const useStyles = makeStyles((theme) => ({
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

const steps = ['Upload CSV', 'Header Index', 'First Data Index', 'Mapping Data'];

const CsvUploadDialog = (props: ICsvUploadDialog) => {
    const classes = useStyles();
    const { setIsLoading, isDialogOpen, handleCloseDialog, title, dataModel, handleSaveUpload } = props;

    const [isLoaded, setIsLoaded] = useState(false);
    const [brandData, setBrandData] = useState({} as any);
    const [activeStep, setActiveStep] = React.useState(0);
    const [uploadData, setUploadData] = useState([]);
    const [headerIndex, setHeaderIndex] = useState(null as any);
    const [firstDataIndex, setFirstDataIndex] = useState(null as any);
    const [dataMappingValue, setDataMappingValue] = useState({} as any);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            let activeDataBrand: any;

            await BrandService.getAll().then((res: any) => {
                activeDataBrand = FunctionUtil.getConvertArrayToAssoc(res.data);
            })

            setBrandData(activeDataBrand);
            setIsLoaded(true);
        }

        fetchData();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            setIsLoading(true);
            const tempDataMappingValue: any = { ...dataModel };

            Object.keys(dataModel).forEach((key: any, index: any) => {
                if (dataModel[key] === DATA_MODEL_TYPE.KEY) {
                    tempDataMappingValue[key] = DATA_MAPPING_VALUE_TYPE.UUIDV;
                } else if (dataModel[key] === DATA_MODEL_TYPE.DATA) {
                    tempDataMappingValue[key] = DATA_MAPPING_VALUE_TYPE.EMPTY_STRING;
                } else if (dataModel[key] === DATA_MODEL_TYPE.FOREIGN_KEY_BRAND) {
                    tempDataMappingValue[key] = Object.keys(brandData)[0];
                }
            })

            setDataMappingValue(tempDataMappingValue);
            setIsLoading(false);
        }
    }, [isLoaded, handleCloseDialog]);

    const handleNext = () => {
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handleUpload = (data: any) => {
        setUploadData(data);
    };

    const handleDataMappingChange = (e: any) => {
        setDataMappingValue({ ...dataMappingValue, [e.target.name]: e.target.value })
    };

    const handleDataMapping = () => {
        setIsLoading(true);
        const tempDataMapped: any[] = [];
        Object.values(uploadData).forEach((data: any, index: any) => {
            if (index >= firstDataIndex) {
                const tempSingleData = { ...dataMappingValue };
                let isValid = true;
                Object.keys(tempSingleData).forEach((key: any, index: any) => {
                    if (dataModel[key] === DATA_MODEL_TYPE.DATA || dataModel[key] === DATA_MODEL_TYPE.KEY) {
                        if (tempSingleData[key] === DATA_MAPPING_VALUE_TYPE.UUIDV) {
                            tempSingleData[key] = uuidv4();
                        } else if (tempSingleData[key] === DATA_MAPPING_VALUE_TYPE.EMPTY_STRING) {
                            tempSingleData[key] = "";
                        } else if (tempSingleData[key] === DATA_MAPPING_VALUE_TYPE.RANDOM_CODE) {
                            tempSingleData[key] = FunctionUtil.getMakeCode(6);
                        } else {
                            if (data[tempSingleData[key]] === "") {
                                isValid = false;
                            }
                            tempSingleData[key] = data[tempSingleData[key]];
                        }
                    }
                })
                if (isValid) {
                    tempDataMapped.push(tempSingleData);
                }
            }
        })
        handleSaveUpload(tempDataMapped);
        closeDialog();
        setIsLoading(false);
    };

    const closeDialog = () => {
        setActiveStep(0);
        setUploadData([]);
        setHeaderIndex(null);
        setFirstDataIndex(null);
        handleCloseDialog();
    }

    const columns = [
        {
            name: "index", label: "Index"
        },
        {
            name: "value", label: "Value"
        },
    ] as any;

    let data: any[] = [];
    uploadData.forEach((value: any, index: any) => {
        if (index < 8) {
            data.push({ "index": index, "value": JSON.stringify(value) })
        }
    })

    const optionsHeaderIndex = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        pagination: false,
        selectableRows: "single" as any,
        selectableRowsHeader: false,
        selectableRowsOnClick: false,
        sortFilterList: false,
        sort: false,
        filter: false,
        search: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbarSelect: (selectedRows: any, displayData: any, setSelectedRows: any) => <IconBtn style={{ marginRight: "24px" }} icon={DoneAll} tooltip={"Select Header"} handleClick={() => { setHeaderIndex(selectedRows.data[0].dataIndex); }}></IconBtn>,
    };

    const optionsFirstDataIndex = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        pagination: false,
        selectableRows: "single" as any,
        selectableRowsHeader: false,
        selectableRowsOnClick: false,
        sortFilterList: false,
        sort: false,
        filter: false,
        search: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbarSelect: (selectedRows: any, displayData: any, setSelectedRows: any) => <IconBtn style={{ marginRight: "24px" }} icon={DoneAll} tooltip={"Select First Data"} handleClick={() => { setFirstDataIndex(selectedRows.data[0].dataIndex); }}></IconBtn>,
    };

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                open={isDialogOpen}
                onClose={closeDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <Typography component="h1" variant="h4" align="center">
                        {title}
                    </Typography>
                    <Stepper activeStep={activeStep} className={classes.stepper}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <>
                        {activeStep === steps.length ? (
                            <>
                                <Typography variant="h5" gutterBottom>
                                    {"Thank you for your order."}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {" Your order number is #2001539. We have emailed your order confirmation, and will send you an update when your order has shipped."}
                                </Typography>
                            </>
                        ) : (
                                <>
                                    {activeStep === 0 && (
                                        <CSVReader
                                            cssClass="react-csv-input"
                                            onFileLoaded={handleUpload}
                                        />
                                    )}

                                    {activeStep === 1 &&
                                        uploadData.length > 0 && (
                                            <>
                                                <Typography variant="overline" display="block" gutterBottom>
                                                    {"Selected Index: " + headerIndex}
                                                </Typography>
                                                <MUIDataTable
                                                    title={"Choose Table Header"}
                                                    data={data}
                                                    columns={columns}
                                                    options={optionsHeaderIndex}
                                                />
                                            </>
                                        )
                                    }

                                    {activeStep === 2 &&
                                        uploadData.length > 0 && (
                                            <>
                                                <Typography variant="overline" display="block" gutterBottom>
                                                    {"Selected Index: " + firstDataIndex}
                                                </Typography>
                                                <MUIDataTable
                                                    title={"Choose Table First Data"}
                                                    data={data}
                                                    columns={columns}
                                                    options={optionsFirstDataIndex}
                                                />
                                            </>
                                        )
                                    }

                                    {activeStep === 3 &&
                                        headerIndex !== null &&
                                        Object.keys(dataModel).map((key: any, index: any) => (
                                            <Grid key={key} container spacing={3}>
                                                <Grid item sm={6}>
                                                    {key}
                                                </Grid>
                                                <Grid item sm={6}>
                                                    <FormControl style={{ width: "100%" }}>
                                                        <Select
                                                            labelId="mapping-label"
                                                            id={key}
                                                            name={key}
                                                            value={dataMappingValue[key]}
                                                            onChange={handleDataMappingChange}
                                                        >
                                                            {dataModel[key] === DATA_MODEL_TYPE.KEY && (
                                                                <MenuItem key={DATA_MAPPING_VALUE_TYPE.UUIDV + index} value={DATA_MAPPING_VALUE_TYPE.UUIDV}>{DATA_MAPPING_VALUE_TYPE.UUIDV}</MenuItem>
                                                            )}
                                                            {dataModel[key] === DATA_MODEL_TYPE.DATA && (
                                                                <MenuItem key={DATA_MAPPING_VALUE_TYPE.EMPTY_STRING + index} value={DATA_MAPPING_VALUE_TYPE.EMPTY_STRING}>{"EMPTY STRING"}</MenuItem>
                                                            )}
                                                            {dataModel[key] === DATA_MODEL_TYPE.DATA && (
                                                                <MenuItem key={DATA_MAPPING_VALUE_TYPE.RANDOM_CODE + index} value={DATA_MAPPING_VALUE_TYPE.RANDOM_CODE}>{"RANDOM CODE"}</MenuItem>
                                                            )}
                                                            {dataModel[key] === DATA_MODEL_TYPE.DATA &&
                                                                Object.values(uploadData[headerIndex]).map((data: any, index: any) => {
                                                                    return (
                                                                        <MenuItem key={DATA_MODEL_TYPE.DATA + index} value={index}>{data}</MenuItem>
                                                                    )
                                                                })
                                                            }
                                                            {dataModel[key] === DATA_MODEL_TYPE.FOREIGN_KEY_BRAND &&
                                                                Object.values(brandData).map((data: any) => {
                                                                    return (
                                                                        <MenuItem key={data._id} value={data._id}>{data.name}</MenuItem>
                                                                    )
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        ))
                                    }

                                    <div className={classes.buttons}>
                                        {activeStep !== 0 && (
                                            <Button onClick={handleBack} className={classes.button}>
                                                {"Back"}
                                            </Button>
                                        )}
                                        {activeStep === 0 && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleNext}
                                                className={classes.button}
                                                disabled={uploadData.length > 0 ? false : true}
                                            >
                                                {'Next'}
                                            </Button>
                                        )}
                                        {activeStep === 1 && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleNext}
                                                className={classes.button}
                                                disabled={headerIndex !== null ? false : true}
                                            >
                                                {'Next'}
                                            </Button>
                                        )}
                                        {activeStep === 2 && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleNext}
                                                className={classes.button}
                                                disabled={firstDataIndex !== null ? false : true}
                                            >
                                                {'Next'}
                                            </Button>
                                        )}
                                        {activeStep === 3 && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleDataMapping}
                                                className={classes.button}
                                                disabled={false}
                                            >
                                                {'Data Mapping'}
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                    </>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default CsvUploadDialog;