import React from 'react';

import Button from '@mui/material/Button';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';




export const DeleteConfirmationButton = ({id, name, onDelete}) =>
{   
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (event) => {
        const npo_id = event.target.value;
        if (npo_id !== "cancel")
        {
            console.log("deleting: " + npo_id);
            console.log(onDelete(npo_id));
        }
        
        setOpen(false);
    };

    return (
        <div>
            <Tooltip title={<span style={{ fontSize: "15px" }}>Delete this nonprofit</span>}>
                <IconButton onClick={handleClickOpen} edge="end" aria-label="comments">
                    <DeleteForeverIcon />
                </IconButton>
            </Tooltip>
            
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete {name}?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this nonprofit?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} value="cancel" autoFocus>Cancel</Button>
                    <Button onClick={handleClose} value={id}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );

};