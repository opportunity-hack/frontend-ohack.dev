import React from "react";


import { EditNonProfit } from "./nonprofit-edit";
import { AddNonProfit } from "./nonprofit-add";

import { useState, useEffect } from "react";
import { useAdmin } from '../../hooks/use-admin-check'


export const Admin = ({ admin }) => {
    // The right way to do this is probably using React Redux to store the state more globally, but for now we'll do it this way
    const { getIsAdmin } = useAdmin();
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        getIsAdmin()
            .then((response) => {
                if (response.status) {
                    if (response.status === 403) {
                        setIsAdmin(false);
                    }
                }
                else {
                    setIsAdmin(true);
                }
            });
    },
        []  // Never trigger this again, don't give it any variables to watch
    );    

    if (!isAdmin)
   {
    return(<span></span>);
   } 


    return(
        <div>
        <AddNonProfit></AddNonProfit>

        <EditNonProfit></EditNonProfit>
        </div>
        );
};
