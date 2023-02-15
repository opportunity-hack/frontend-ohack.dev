import { Button, Snackbar } from '@mui/material'
import { useState } from 'react'
import ShareIcon from '@mui/icons-material/Share';
export default function CopyToClipboardButton({ location }) 
{
    const [open, setOpen] = useState(false);
    const handleClick = () => {
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
        <>
          <Button onClick={handleClick}><ShareIcon/></Button>
          <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            autoHideDuration={2000}
            message="Copied link to clipboard"
          />
        </>
    )
}
