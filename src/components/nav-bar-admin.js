import React from "react";
import { Link } from "react-router-dom";

import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export const NavBarAdmin = ({ admin }) => {    
    if(admin)
    {
        return (<Link to="/admin"><Tooltip title="You are an admin">
            <IconButton>
                <AdminPanelSettings className="admin-notification" />
            </IconButton>
        </Tooltip></Link>);
    }
    else
    {
        return(<span></span>);
    }
};
