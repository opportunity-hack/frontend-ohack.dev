import React from "react";
import { Grid } from "@mui/material";



function ThePlaceWhere() {
    return(
    <Grid container style={{
          padding: "1rem 5% 0px 0px",
          marginTop: "3rem",
        }}>
          
          <Grid style={{
            padding: "1rem 5% 0px 0px",
            marginTop: "3rem",      
          }}>
            <span style={{              
              fontSize: '3em'                
            }}>
            The place where
            </span>
            <div>
            <span style={{
              color: 'var(--blue)',
              fontSize: '1.6em'              
            }}>Nonprofits, Hackers, Mentors, Volunteers   
            </span>
            </div>
            <span style={{              
              fontSize: '3em'                
            }}>
            unite
            </span>
          </Grid>                  
        </Grid>
    );
}
export default ThePlaceWhere;