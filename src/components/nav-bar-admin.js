import React from "react";
import Link from "next/link";

import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import useAdmin from '../hooks/use-admin-check'


export default function NavBarAdmin(){    
    const { isAdmin } = useAdmin();

    if (isAdmin)
    {
        return (<Link href="/admin"><Tooltip title="You are an admin">
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
