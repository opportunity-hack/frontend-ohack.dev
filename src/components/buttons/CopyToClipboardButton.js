import { Button, Snackbar } from '@mui/material'
import { useState } from 'react'
import ShareIcon from '@mui/icons-material/Share';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

export default function CopyToClipboardButton({ location }) 
{
    const [open, setOpen] = useState(false);
    const handleClick = () => {
      console.log("Copy to clipboard");
      setOpen(true);

      if(location != null)
      {
        let link = window.location.origin.toString() + "/" + location;
        navigator.clipboard.writeText(link);
      }
      else {
        navigator.clipboard.writeText(window.location.toString());
      }
      
    }
    
    return (
      <Stack spacing={0} margin={0} >
        <Snackbar
          open={open}          
          onClose={() => setOpen(false)}
          autoHideDuration={2000}
          message="Copied link to clipboard"
        />

        <Tooltip
          enterTouchDelay={0}
          title={
            <span
              style={{ fontSize: "14px" }}
            >Click to copy and share</span>
          }
          style={{ marginLeft: "2rem" }}
        >
        <ShareIcon onClick={handleClick} />          
        </Tooltip>
          
      </Stack>
    )
}
