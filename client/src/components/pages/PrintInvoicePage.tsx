import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppContext } from '../../App';
import { format, startOfDay, endOfDay } from 'date-fns'

import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import DescriptionIcon from '@material-ui/icons/Description';

// Types
import { ERROR_TYPE } from '../../types/enum';

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

// PDF
import { PDFViewer, PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFFFFF',
        padding: 30
    },
    sectionProduct: {
        border: '1pt solid black',
        padding: 5,
        marginBottom: 5
    },
    sectionSerialNumber: {
        flexDirection: 'row',
    },
    sectionContentSerialNumber: {
        flexGrow: 1,
        width: 200,
    },
    title: {
        fontSize: 20,
        marginBottom: 5,
        textAlign: "center"
    },
    company: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: "center"
    },
    subTitle: {
        fontSize: 14,
        marginBottom: 5,
    },
    brand: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 5,
    },
    product: {
        fontSize: 12,
        fontWeight: 800,
        marginBottom: 10,
    },
    serialNumber: {
        fontSize: 10,
        marginBottom: 3,
    },
});

const InvoicePage = (props: any) => {
    const { selectedInvoiceData } = props;

    const uniqueBrands = selectedInvoiceData.map((item: any) => item.brand).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
    const uniqueProducts = selectedInvoiceData.map((item: any) => item.product).filter((value: any, index: any, self: any) => self.indexOf(value) === index);

    let invoiceSummary = [] as any;

    uniqueBrands.forEach((uniqueBrand: any) => {
        let tempBrand = { brand: uniqueBrand.name, products: [] as any }
        uniqueProducts.forEach((uniqueProduct: any) => {
            let tempProduct = { product: uniqueProduct.name, serialNumbers: [] as any }
            selectedInvoiceData.forEach((data: any) => {
                if (data.brand._id === uniqueBrand._id && data.product._id === uniqueProduct._id) {
                    tempProduct.serialNumbers.push(data.serialNumber);
                }
            })
            if (tempProduct.serialNumbers.length > 0) {
                tempBrand.products.push(tempProduct);
            }
        })
        invoiceSummary.push(tempBrand);
    })

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{"Surat Jalan"}</Text>
                <Text style={styles.company}>{"PT. Lakone Komunika Jaya Abadi"}</Text>
                <Text style={styles.subTitle}>{"Invoice:"} {selectedInvoiceData[0].invoice}</Text>
                <Text style={styles.subTitle}>{"Customer:"} {selectedInvoiceData[0].customer.name}</Text>
                <Text style={styles.subTitle}>{"Date:"} {format(new Date(selectedInvoiceData[0].createdAt), "MMM d, yyyy")}</Text>

                {invoiceSummary.map((brand: any, index: any) => (
                    <View key={`brand${index}`}>
                        <Text style={styles.brand}>{"~"} {brand.brand}</Text>
                        {brand.products.map((product: any, index: any) => (
                            <View key={`product${index}`} style={styles.sectionProduct}>
                                <Text style={styles.product}>{product.product}          {`Qty: ${product.serialNumbers.length}`}</Text>
                                <View style={styles.sectionSerialNumber}>
                                    <Text style={styles.serialNumber}>
                                        {product.serialNumbers.map((serialNumber: any, index: any) => (
                                            <>
                                                {serialNumber}{" ; "}
                                            </>
                                        ))}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </Page>
        </Document>
    )
}

const PrintInvoicePage = (props: any) => {
    const {
        setIsLoading,
        handleShowSuccessSnackbar,
        handleShowErrorSnackbar,
        setSnackbarMessage
    } = useContext(AppContext);

    const initialErrorState = {
        invoice: { type: [ERROR_TYPE.REQUIRED], status: false },
    };
    const initialFormDataState = {
        invoice: ''
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
    const [formData, setFormData] = useState(initialFormDataState as any);
    const [error, setError] = useState(initialErrorState as any);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

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
            setIsLoading(false);
        }

        fetchData();
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })

        if (e.target.value === "") {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: true } })
        } else {
            setError({ ...error, [e.target.name]: { ...error[e.target.name], status: false } })
        }
    }

    const submit = async (e: any) => {
        e.preventDefault();

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
        } else {
            setIsLoading(true);
        }

        // Valid data        
        ShipmentService.getInvoice(formData).then((res: any) => {
            let tempTableData: any[] = [];

            res.data.forEach((shipment: any) => {
                const productFound = productData[shipment.productId];
                tempTableData.push({
                    "_id": shipment._id,
                    "invoice": formData.invoice,
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
        }).catch((error: any) => {
            setSnackbarMessage(error.response.data.msg);
            handleShowErrorSnackbar();
        });
        setIsLoading(false);
    };

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
            name: "createdAt", label: "Created At"
        },
    ] as any;

    let data: any[] = [];
    tableData.forEach((td: any) => {
        data.push({ "_id": td._id, "invoice": td.invoice ? td.invoice : "-", "brand": td.brand.name, "product": td.product.name, "serialNumber": td.serialNumber, "customer": td.customer ? td.customer.name : "-", "action": td.action.name, "location": td.location.name, "quantity": td.action.value, "user": td.user.name, "createdAt": format(new Date(td.createdAt), "MMM d, yyyy HH:mm:ss") })
    })

    const options = {
        filterType: "dropdown" as any,
        responsive: "scroll" as any,
        selectableRows: "none" as any,
        downloadOptions:
        {
            filename: 'invoice ' + `${tableData.length > 0 ? tableData[0].invoice : "Not Found!"}` + '.csv',
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
                    height: 'calc(100vh - 350px)'
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
                            <DescriptionIcon style={{ fontSize: "30px", position: "absolute", left: "0px" }}></DescriptionIcon>
                            <h2 style={{ marginTop: "0px", color: "black" }}>
                                {`Invoice: ${tableData.length > 0 ? tableData[0].invoice : "Not Found!"}`}
                            </h2>
                        </Grid>
                        <Grid item xs={12} sm={5} style={{ paddingLeft: "40px", position: "relative" }}>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <h1 style={{ marginTop: "-5px", color: "black" }}>{"#" + tableData.length}</h1>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Paper style={{ height: '100%', padding: '20px' }}>
                                <form
                                    onSubmit={submit}
                                    autoComplete="off"
                                    noValidate
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={12}>
                                            <Typography variant="h6" gutterBottom>
                                                {"Print Invoice"}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <TextField
                                                required
                                                value={formData.invoice}
                                                margin="normal"
                                                id="invoice"
                                                name="invoice"
                                                label="Invoice"
                                                type="text"
                                                fullWidth
                                                onChange={handleChange}
                                                error={error.invoice.status}
                                                helperText={error.invoice.status ? defaultErrorMessage : ""}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <Button type="submit" fullWidth variant="contained" size="large" color="primary">
                                                {"Search"}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                                {tableData.length > 0 && (
                                    <Grid item xs={12} sm={12} style={{ marginTop: 40, textAlign: "center" }}>
                                        <PDFViewer>
                                            <InvoicePage selectedInvoiceData={tableData} />
                                        </PDFViewer>
                                        <Button variant="outlined" color="primary">
                                            <PDFDownloadLink document={<InvoicePage selectedInvoiceData={tableData} />} fileName={`invoice_${tableData.length > 0 ? tableData[0].invoice : "NONE"}.pdf`}>
                                                {({ blob, url, loading, error }) => (loading ? 'Loading document...' : `Download Invoice ${tableData.length > 0 ? tableData[0].invoice : "Not Found!"}`)}
                                            </PDFDownloadLink>
                                        </Button>
                                    </Grid>
                                )}
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={8}>
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
                </>
            )
            }
        </>
    );
}

export default PrintInvoicePage;