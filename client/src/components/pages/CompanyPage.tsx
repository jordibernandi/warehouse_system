import React, { useState, useEffect, useContext } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { v4 as uuidv4 } from 'uuid';

import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from '@material-ui/icons/Delete';

// Layouts
import IconBtn from '../appLayout/IconBtn';

// Types
import { DIALOG_TYPE, ERROR_TYPE } from '../../types/enum';

// Utils
import FunctionUtil from '../../utils/FunctionUtil';

// Services
import CompanyService from '../../services/CompanyService';

const CompanyPage = (props: any) => {
    const {
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const initialErrorState = {
        _id: { type: [], status: false },
        name: { type: [ERROR_TYPE.REQUIRED, ERROR_TYPE.UNIQUE], status: false },
    };
    const initialFormDataState = { _id: uuidv4(), name: '' };
    const initialSelectedDataIndex = 0;
    const defaultErrorMessage = "Value is Empty or Invalid";

    const [isLoaded, setIsLoaded] = useState(false);
    const [companyData, setCompanyData] = useState({} as any);
    const [tableData, setTableData] = useState([] as any);
    const [isOpenFormDialog, setIsOpenFormDialog] = useState(false);
    const [isOpenConfirmationDialog, setIsOpenConfirmationDialog] = useState(false);
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);
    const [selectedDataIndex, setSelectedDataIndex] = useState(initialSelectedDataIndex);
    const [selectedData, setSelectedData] = useState([] as any[]);
    const [dialogType, setDialogType] = useState(DIALOG_TYPE.REGISTER as DIALOG_TYPE);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            let activeDataCompany: any;

            await CompanyService.getAll().then((res: any) => {
                activeDataCompany = FunctionUtil.getConvertArrayToAssoc(res.data);
            })

            let tempTableData: any[] = [];

            Object.values(activeDataCompany).forEach((data: any) => {
                tempTableData.push({ "_id": data._id, "name": data.name });
            })

            setCompanyData(activeDataCompany);
            setTableData(tempTableData);
            setIsLoaded(true);
        }

        fetchData();
        setIsLoading(false);
    }, []);

    const handleCloseFormDialog = () => {
        setIsOpenFormDialog(false);
        setFormData(initialFormDataState);
        setError(initialErrorState);
        setSelectedDataIndex(initialSelectedDataIndex);
    }

    const handleCloseConfirmationDialog = () => {
        setIsOpenConfirmationDialog(false);
        setSelectedData([]);
    }

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (e.target.value === "") {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: true } })
        } else {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: false } })
        }
    }

    const handleClickAddButton = () => {
        setIsOpenFormDialog(true);
        setDialogType(DIALOG_TYPE.REGISTER);
    }

    const handleClickDeleteButton = (selectedRows: any) => {
        let tempSelectedData: any[] = [];

        selectedRows.data.forEach((sr: any) => {
            tempSelectedData.push(tableData[sr.dataIndex]._id);
        })

        setSelectedData(tempSelectedData);
        setIsOpenConfirmationDialog(true);
    }

    const handleDoubleClickRow = (dataIndex: any) => {
        const data = tableData[dataIndex]

        setDialogType(DIALOG_TYPE.EDIT);
        setFormData({ _id: data._id, name: data.name });
        setIsOpenFormDialog(true);
        setSelectedDataIndex(dataIndex);
    }

    const submit = async (e: any) => {
        e.preventDefault();

        setIsLoading(true);

        let isValid = true;

        const tempError = { ...error }

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
                if (dialogType === DIALOG_TYPE.EDIT) {
                    tempTableData = tempTableData.filter(function (data: any) {
                        return data._id !== formData._id;
                    });
                }
                Object.values(tempTableData).forEach((data: any) => {
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

        const newTableData = { "_id": formData._id, "name": formData.name };

        if (dialogType === DIALOG_TYPE.REGISTER) {
            CompanyService.add(formData).then((res: any) => {
                if (res.status === 200) {
                    setTableData([...tableData, newTableData]);
                    handleCloseFormDialog();
                    setFormData(initialFormDataState);

                    setSnackbarMessage("Success!");
                    handleShowSuccessSnackbar();
                } else {
                    setSnackbarMessage("Something went wrong!");
                    handleShowErrorSnackbar();
                }
            })
        } else if (dialogType === DIALOG_TYPE.EDIT) {
            CompanyService.edit(formData._id, formData).then((res: any) => {
                if (res.status === 200) {
                    const tempTableData = [...tableData];
                    tempTableData[selectedDataIndex] = newTableData;
                    setTableData(tempTableData);
                    handleCloseFormDialog();
                    setFormData(initialFormDataState);
                    setSelectedDataIndex(initialSelectedDataIndex);

                    setSnackbarMessage("Success!");
                    handleShowSuccessSnackbar();
                } else {
                    setSnackbarMessage("Something went wrong!");
                    handleShowErrorSnackbar();
                }
            })
        }
        setIsLoading(false);
    };

    const submitDelete = async (e: any) => {
        e.preventDefault();

        setIsLoading(true);

        CompanyService.softDelete({ selectedData: selectedData }).then((res: any) => {
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
            name: "name", label: "Name"
        }
    ] as any;

    let data: any[] = [];
    tableData.forEach((td: any) => {
        data.push({ "_id": td._id, "name": td.name })
    })

    const options = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        setRowProps: (row: any, dataIndex: any) => ({
            onDoubleClick: () => {
                handleDoubleClickRow(dataIndex);
            }
        }),
        customToolbarSelect: (selectedRows: any, displayData: any, setSelectedRows: any) => <IconBtn style={{ marginRight: "24px" }} icon={DeleteIcon} tooltip={"Delete"} handleClick={() => { handleClickDeleteButton(selectedRows) }}></IconBtn>,
        customToolbar: () => <IconBtn icon={AddIcon} tooltip={"Register New Data"} handleClick={handleClickAddButton}></IconBtn>,
        downloadOptions:
        {
            filename: 'listCompany.csv',
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
                    height: 'calc(100vh - 300px)'
                }
            }
        } as any
    });

    return (
        <>
            {isLoaded && (
                <>
                    <MuiThemeProvider theme={theme}>
                        <MUIDataTable
                            title={"List of Companies"}
                            data={data}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>

                    <Dialog fullWidth={true} open={isOpenFormDialog} onClose={handleCloseFormDialog} aria-labelledby="form-dialog-title">
                        <form
                            onSubmit={submit}
                            autoComplete="off"
                            noValidate
                        >
                            <DialogTitle id="form-dialog-title">{dialogType === DIALOG_TYPE.REGISTER ? "Register New Company" : "Edit Company"}</DialogTitle>
                            <DialogContent>
                                <TextField
                                    value={formData.name}
                                    margin="normal"
                                    id="name"
                                    name="name"
                                    label="Name"
                                    type="text"
                                    fullWidth
                                    onChange={handleChange}
                                    required
                                    error={error.name.status}
                                    helperText={error.name.status ? defaultErrorMessage : ""}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseFormDialog} color="primary">
                                    {"Cancel"}
                                </Button>
                                <Button type="submit" color="primary">
                                    {"Submit"}
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>

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
                            <Button onClick={submitDelete} color="primary">
                                {"Delete"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
}

export default CompanyPage;
