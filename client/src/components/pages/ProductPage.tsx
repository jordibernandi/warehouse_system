import React, { useState, useEffect, useContext } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { v4 as uuidv4 } from 'uuid';

import MUIDataTable from 'mui-datatables';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
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
import AddIcon from "@material-ui/icons/Add";
import PublishIcon from "@material-ui/icons/Publish";
import DeleteIcon from '@material-ui/icons/Delete';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';

// Layouts
import IconBtn from '../appLayout/IconBtn';
import CsvUploadDialog from '../appLayout/CsvUploadDialog';

// Types
import { DIALOG_TYPE, ERROR_TYPE, DATA_MODEL_TYPE } from '../../types/enum';

// Utils
import FunctionUtil from '../../utils/FunctionUtil';

// Services
import ProductService from '../../services/ProductService';
import BrandService from '../../services/BrandService';

// PDF
import { PDFViewer, PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// QR Generator
import QRCode from 'qrcode.react';

// Create styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFFFFF',
    },
    section: {
        margin: 20,
        padding: 15,
        border: '1pt solid black',
        flexDirection: 'row',
    },
    sectionContentDesc: {
        flexGrow: 1,
        width: 350
    },
    sectionContentQR: {
        flexGrow: 1,
    },
    brand: {
        fontSize: 14,
        marginBottom: 10
    },
    name: {
        fontSize: 18,
        marginBottom: 10
    },
    qrCode: {
        width: 50,
        marginBottom: 5
    },
    code: {
        fontSize: 12
    },
    downloadLink: {
        textDecoration: 'none',
        color: 'gray'
    }
});

const QRCodePage = (props: any) => {
    const { selectedQRCodeData } = props;
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {selectedQRCodeData.map((qrCodeData: any, index: any) => {
                    const qrCodeCanvas = document.querySelectorAll(
                        "[data-qr='" + qrCodeData.code + "']"
                    )[0];

                    if (qrCodeCanvas) {
                        const qrCodeDataUri = (qrCodeCanvas as any).toDataURL("image/png");

                        return (
                            <View style={styles.section} key={`qr${index}`}>
                                <View style={styles.sectionContentDesc}>
                                    <Text style={styles.brand}>{qrCodeData.brand.name}</Text>
                                    <Text style={styles.name}>{qrCodeData.name}</Text>
                                </View>
                                <View style={styles.sectionContentQR}>
                                    <Image style={styles.qrCode} src={qrCodeDataUri} />
                                    <Text style={styles.code}>{qrCodeData.code}</Text>
                                </View>
                            </View>
                        )
                    }
                })}
            </Page>
        </Document>
    )
}

const ProductPage = (props: any) => {
    const {
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const initialErrorState = {
        _id: { type: [], status: false },
        brandId: { type: [ERROR_TYPE.REQUIRED], status: false },
        code: { type: [ERROR_TYPE.REQUIRED, ERROR_TYPE.UNIQUE], status: false },
        name: { type: [ERROR_TYPE.REQUIRED, ERROR_TYPE.UNIQUE], status: false },
    };
    const initialFormDataState = { _id: uuidv4(), brandId: '', code: '', name: '' };
    const dataModel = { _id: DATA_MODEL_TYPE.KEY, brandId: DATA_MODEL_TYPE.FOREIGN_KEY_BRAND, code: DATA_MODEL_TYPE.DATA, name: DATA_MODEL_TYPE.DATA };
    const initialSelectedDataIndex = 0;
    const defaultErrorMessage = "Value is Empty or Invalid";

    const [isLoaded, setIsLoaded] = useState(false);
    const [productData, setProductData] = useState({} as any);
    const [brandData, setBrandData] = useState({} as any);
    const [tableData, setTableData] = useState([] as any);
    const [isOpenFormDialog, setIsOpenFormDialog] = useState(false);
    const [isOpenUploadDialog, setIsOpenUploadDialog] = useState(false);
    const [isOpenConfirmationDialog, setIsOpenConfirmationDialog] = useState(false);
    const [isOpenPrintQRCodeDialog, setIsOpenPrintQRCodeDialog] = useState(false);
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);
    const [selectedDataIndex, setSelectedDataIndex] = useState(initialSelectedDataIndex);
    const [selectedData, setSelectedData] = useState([] as any[]);
    const [selectedQRCodeData, setSelectedQRCodeData] = useState([] as any[]);
    const [dialogType, setDialogType] = useState(DIALOG_TYPE.REGISTER as DIALOG_TYPE);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            let dataProduct: any;
            let dataBrand: any;

            await ProductService.getAll().then((res: any) => {
                dataProduct = FunctionUtil.getConvertArrayToAssoc(res.data);
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

            let tempTableData: any[] = [];

            Object.values(dataProduct).filter(FunctionUtil.activeFilterFunction).forEach((data: any) => {
                tempTableData.push({ "_id": data._id, "brand": dataBrand[data.brandId], "code": data.code, "name": data.name, "qrCode": data.code });
            })

            setProductData(dataProduct);
            setBrandData(dataBrand);
            setTableData(tempTableData);
            setIsLoaded(true);
            setIsLoading(false);
        }

        fetchData();
    }, []);

    const handleSaveUpload = async (uploadData: any) => {
        let tempUploadData: any[] = [];
        let tempTableData: any[] = []
        uploadData.forEach((data: any) => {
            var dataExist = tableData.some(function (el: any) {
                return (el.name === data.name);
            });

            if (!dataExist) {
                tempUploadData.push(data);
                tempTableData.push({ "_id": data._id, "brand": brandData[data.brandId], "code": data.code, "name": data.name, "qrCode": data.code });
            }
        })

        await ProductService.saveUpload(tempUploadData).then((res: any) => {
            var newArray = tableData.concat(tempTableData);
            setTableData(newArray);
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
    }

    const handleCloseFormDialog = () => {
        setIsOpenFormDialog(false);
        setFormData(initialFormDataState);
        setError(initialErrorState);
        setSelectedDataIndex(initialSelectedDataIndex);
    }

    const handleCloseUploadDialog = () => {
        setIsOpenUploadDialog(false);
    }

    const handleCloseConfirmationDialog = () => {
        setIsOpenConfirmationDialog(false);
        setSelectedData([]);
    }

    const handleClosePrintQRCodeDialog = () => {
        setIsOpenPrintQRCodeDialog(false);
        setSelectedQRCodeData([]);
    }

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })

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

    const handleClickUploadButton = () => {
        setIsOpenUploadDialog(true);
    }

    const handleClickDeleteButton = (selectedRows: any) => {
        let tempSelectedData: any[] = [];

        selectedRows.data.forEach((sr: any) => {
            tempSelectedData.push(tableData[sr.dataIndex]._id);
        })

        setSelectedData(tempSelectedData);
        setIsOpenConfirmationDialog(true);
    }

    const handleClickPrintQRButton = (selectedRows: any) => {
        let tempSelectedData: any[] = [];

        selectedRows.data.forEach((sr: any) => {
            tempSelectedData.push(tableData[sr.dataIndex]);
        })

        setSelectedQRCodeData(tempSelectedData);
        setIsOpenPrintQRCodeDialog(true);
    }

    const handleDoubleClickRow = (dataIndex: any) => {
        const data = tableData[dataIndex]

        setDialogType(DIALOG_TYPE.EDIT);
        setFormData({ _id: data._id, brandId: data.brand._id, code: data.code, name: data.name })
        setIsOpenFormDialog(true);
        setSelectedDataIndex(dataIndex);
    }

    const submit = async (e: any) => {
        e.preventDefault();

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

        const newTableData = { "_id": formData._id, "brand": { _id: formData.brandId, name: brandData[formData.brandId].name }, "code": formData.code, "name": formData.name, "qrCode": formData.code };

        if (dialogType === DIALOG_TYPE.REGISTER) {
            await ProductService.add(formData).then((res: any) => {
                setTableData([...tableData, newTableData]);
                handleCloseFormDialog();
                setFormData(initialFormDataState);

                setSnackbarMessage("Success!");
                handleShowSuccessSnackbar();
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });
        } else if (dialogType === DIALOG_TYPE.EDIT) {
            await ProductService.edit(formData._id, formData).then((res: any) => {
                const tempTableData = [...tableData];
                tempTableData[selectedDataIndex] = newTableData;
                setTableData(tempTableData);
                handleCloseFormDialog();
                setFormData(initialFormDataState);
                setSelectedDataIndex(initialSelectedDataIndex);

                setSnackbarMessage("Success!");
                handleShowSuccessSnackbar();
            }).catch((error: any) => {
                setSnackbarMessage(error.response.data.msg);
                handleShowErrorSnackbar();
            });
        }
        setIsLoading(false);
    };

    const submitDelete = async (e: any) => {
        e.preventDefault();

        setIsLoading(true);

        await ProductService.softDelete({ selectedData: selectedData }).then((res: any) => {
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
            name: "code", label: "Code"
        },
        {
            name: "name", label: "Name"
        },
        {
            name: 'qrCode',
            label: "QR Code",
            options: {
                customBodyRender: (value: any) => {
                    return (
                        <QRCode data-qr={value} value={value} />
                    );
                }
            }
        }
    ] as any;

    let data: any[] = [];
    tableData.forEach((td: any) => {
        data.push({ "_id": td._id, "brand": td.brand.name, "code": td.code, "name": td.name, "qrCode": td.code })
    })

    const options = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        setRowProps: (row: any, dataIndex: any) => ({
            onDoubleClick: () => {
                handleDoubleClickRow(dataIndex);
            }
        }),
        customToolbarSelect: (selectedRows: any, displayData: any, setSelectedRows: any) =>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: 'flex-end', }}>
                <IconBtn icon={PictureAsPdfIcon} tooltip={"Print"} handleClick={() => { handleClickPrintQRButton(selectedRows) }}></IconBtn>
                <IconBtn style={{ marginRight: "24px" }} icon={DeleteIcon} tooltip={"Delete"} handleClick={() => { handleClickDeleteButton(selectedRows) }}></IconBtn>
            </div>,
        customToolbar: () =>
            <>
                <IconBtn icon={AddIcon} tooltip={"Register New Data"} handleClick={handleClickAddButton}></IconBtn>
                <IconBtn icon={PublishIcon} tooltip={"Upload Data"} handleClick={handleClickUploadButton}></IconBtn>
            </>,
        downloadOptions:
        {
            filename: 'listProduct.csv',
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
                            title={"List of Products"}
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
                            <DialogTitle id="form-dialog-title">{dialogType === DIALOG_TYPE.REGISTER ? "Register New Product" : "Edit Product"}</DialogTitle>
                            <DialogContent>
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
                                <TextField
                                    value={formData.code}
                                    margin="normal"
                                    id="code"
                                    name="code"
                                    label="Code"
                                    type="text"
                                    fullWidth
                                    onChange={handleChange}
                                    required
                                    error={error.code.status}
                                    helperText={error.code.status ? defaultErrorMessage : ""}
                                />
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

                    <Dialog
                        open={isOpenPrintQRCodeDialog}
                        onClose={handleClosePrintQRCodeDialog}
                        aria-labelledby="qr-dialog-title"
                        aria-describedby="qr-dialog-description"
                    >
                        <DialogTitle id="qr-dialog-title">{"Print QR Code"}</DialogTitle>
                        <DialogContent>
                            <Grid container>
                                <Grid item md={12}>
                                    <PDFViewer>
                                        <QRCodePage selectedQRCodeData={selectedQRCodeData} />
                                    </PDFViewer>
                                </Grid>
                                <Grid item md={12}>
                                    <Typography variant="caption" display="block" gutterBottom>
                                        {"Only print the QR Codes that are displayed on the current screen."}
                                    </Typography>
                                    <Typography variant="caption" display="block" gutterBottom>
                                        {"Change 'Rows per page' to print more..."}
                                    </Typography>
                                    <Button variant="outlined" color="primary">
                                        <PDFDownloadLink document={<QRCodePage selectedQRCodeData={selectedQRCodeData} />} fileName="qr_code.pdf">
                                            {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download QR Code')}
                                        </PDFDownloadLink>
                                    </Button>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePrintQRCodeDialog} color="primary" autoFocus>
                                {"Close"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <CsvUploadDialog setIsLoading={setIsLoading} dataModel={dataModel} handleSaveUpload={handleSaveUpload} title={"Upload CSV List Product"} isDialogOpen={isOpenUploadDialog} handleCloseDialog={handleCloseUploadDialog}></CsvUploadDialog>
                </>
            )}
        </>

    );
}

export default ProductPage;
