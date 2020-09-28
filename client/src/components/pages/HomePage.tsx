import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
    wrapper: {
        color: "#636b6f",
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 200,
        height: "calc(100vh - 270px)",
        margin: 0,
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        textAlign: "center",
    },
    title: {
        fontSize: "84px",
    }
}));

const HomePage = (props: any) => {
    const {
        setIsLoading
    } = useContext(AppContext);

    const classes = useStyles();

    useEffect(() => {
        setIsLoading(false);
    }, []);

    return (
        <div className={classes.wrapper}>
            <Grid container>
                <Grid item xs={12} sm={12} className={classes.title}>
                    {"LKJA"}
                </Grid>
            </Grid>
        </div>
    );
}

export default HomePage;
