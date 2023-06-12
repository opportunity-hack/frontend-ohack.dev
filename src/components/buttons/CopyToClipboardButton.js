import { Button, Snackbar } from '@mui/material'
import { useState } from 'react'
import ShareIcon from '@mui/icons-material/Share';
import Stack from '@mui/material/Stack';

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
        <ShareIcon onClick={handleClick} />          
          
      </Stack>
    )
}
