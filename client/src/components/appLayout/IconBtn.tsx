import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

interface IIconBtn {
    tooltip: string,
    icon: any,
    handleClick: any,
    style?: any,
}

const IconBtn = (props: IIconBtn) => {

    const { tooltip, handleClick, style } = props;

    return (
        <React.Fragment>
            <Tooltip title={tooltip}>
                <IconButton style={style} onClick={handleClick}>
                    <props.icon />
                </IconButton>
            </Tooltip>
        </React.Fragment>
    );
}

export default IconBtn;