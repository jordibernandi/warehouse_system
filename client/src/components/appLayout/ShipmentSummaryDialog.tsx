import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, isSameDay } from 'date-fns'

import { makeStyles } from '@material-ui/core/styles';
import MUIDataTable from 'mui-datatables';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

interface IShipmentSummaryDialog {
    isDialogOpen: boolean,
    handleCloseDialog: any,
    tableData: [{
        _id: string,
        product: any,
        brand: any,
        location: any,
        customer: any,
        action: any,
        serialNumber: any,
        user: any,
        createdAt: any,
    }]
}

const useStyles = makeStyles((theme) => ({

}));

const ShipmentSummaryDialog = (props: IShipmentSummaryDialog) => {
    const classes = useStyles();
    const { isDialogOpen, handleCloseDialog, tableData } = props;

    const [stockSummary, setStockSummary] = useState([] as any);

    useEffect(() => {
        if (isDialogOpen) {
            const uniqueBrands = tableData.map(item => item.brand).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            const uniqueProducts = tableData.map(item => item.product).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            const uniqueLocations = tableData.map(item => item.location).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            const uniqueActions = tableData.map(item => item.action).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            const uniqueDates = tableData.map(item => format(new Date(item.createdAt), "MMM d, yyyy")).filter((value: any, index: any, self: any) => self.indexOf(value) === index);

            let tempStockSummary = [] as any;

            uniqueBrands.forEach((uniqueBrand: any) => {
                let tempBrand = { brand: uniqueBrand.name, products: [] as any }
                uniqueProducts.forEach((uniqueProduct: any) => {
                    let tempProduct = { product: uniqueProduct.name, locations: [] as any }
                    uniqueLocations.forEach((uniqueLocation: any) => {
                        let tempLocation = { location: uniqueLocation.name, actions: [] as any }
                        uniqueActions.forEach((uniqueAction: any) => {
                            let tempAction = { action: uniqueAction.name, dates: [] as any }
                            uniqueDates.forEach((uniqueDate: any) => {
                                let tempDate = { date: uniqueDate, total: 0, values: [] as any };
                                tableData.forEach((data: any) => {
                                    if (data.brand._id === uniqueBrand._id && data.product._id === uniqueProduct._id && data.location._id === uniqueLocation._id && data.action._id === uniqueAction._id && isSameDay(new Date(data.createdAt), new Date(uniqueDate))) {
                                        tempDate.total += data.action.value;
                                        tempDate.values.push(data.action.value);
                                    }
                                })
                                if (tempDate.values.length > 0) {
                                    tempAction.dates.push(tempDate);
                                }
                            })
                            if (tempAction.dates.length > 0) {
                                tempLocation.actions.push(tempAction);
                            }
                        })
                        if (tempLocation.actions.length > 0) {
                            tempProduct.locations.push(tempLocation);
                        }
                    })
                    tempBrand.products.push(tempProduct);
                })
                tempStockSummary.push(tempBrand);
            })

            setStockSummary(tempStockSummary);
        }

    }, [isDialogOpen]);

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                open={isDialogOpen}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <Typography component="h4" variant="h4" align="center">
                        {"Shipment Summary"}
                    </Typography>
                    <Grid container style={{ marginTop: "30px" }}>
                        {stockSummary.length > 0 ?
                            stockSummary.map((brand: any, index: any) => (
                                <Grid key={brand.brand} style={{ paddingLeft: "20px" }} item md={12}>
                                    <Typography component="h5" variant="h5">
                                        {index + 1} - {brand.brand}
                                    </Typography>
                                    {brand.products.map((product: any, index: any) => (
                                        <Grid key={product.product} style={{ paddingLeft: "35px", marginBottom: "10px" }} item md={12}>
                                            <b>{index + 1} - {product.product}</b>
                                            {product.locations.map((location: any) => (
                                                <Grid key={location.location} style={{ paddingLeft: "20px" }} item md={12}>
                                                    <u>{location.location}</u>
                                                    {location.actions.map((action: any) => (
                                                        <Grid key={action.action} style={{ paddingLeft: "20px" }} item md={12}>
                                                            {action.action}:
                                                            {action.dates.map((date: any) => (
                                                                <Grid key={date.date} style={{ paddingLeft: "20px" }} item md={12}>
                                                                    {date.date}
                                                                    <b style={{ paddingLeft: "30px" }}>{date.total}</b>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            ))}

                                        </Grid>
                                    ))}
                                </Grid>
                            )) : (
                                <Grid container>
                                    <Typography variant="body1">
                                        {"Sorry, no matching records found"}
                                    </Typography>
                                </Grid>
                            )}
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default ShipmentSummaryDialog;