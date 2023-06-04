import { useAuth0 } from "@auth0/auth0-react";
import Stack from '@mui/material/Stack';
import { useState } from "react";
// Link
import Link from "next/link";
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
// import hook useNonProfitList
import useNonProfitList from "../../hooks/use-nonprofit-list";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ListOfLinkAndName from "./ListOfLinkAndName";


export default function AdminLinks({ admin } )  {
    // get nonprofit name list from database
    const { nonprofits } = useNonProfitList();
    var nonProfitOptions = [];

    nonprofits.forEach((item) => {
        nonProfitOptions.push(item.name);
    });

    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");

    const [githubLinks, setGitHubLinks] = useState([
        {
            _link: "https://test",
            _name: "test"
        }
    ]);
    const [referencesLinks, setReferencesLinks] = useState([
        {
            _link: "https://reftest",
            _name: "reftest"
        }
    ]);


    function handleClick() {
        setLoading(true);
        setSubmitStatus("");       
    }

    function handleNonProfitChange(event, value){
        nonprofits.forEach((item) => {
            if(item.name === value){
                console.log(item);
                setGitHubLinks(item.github);
                setReferencesLinks(item.references);
            }
        });        
    }
    // const loginCallToAction = (
    //     <div className="content__body">
    //     <Stack direction='column' spacing={1}>
    //         <h1 className="content__title">Please login</h1>
            
    //             <Stack direction='column' spacing={1}>
    //                 <button
    //                     className='button button--primary button--compact'
    //                     onClick={() =>
    //                         loginWithRedirect({
    //                             appState: {
    //                                 returnTo: window.location.pathname,
    //                                 redirectUri: window.location.pathname,
    //                             },
    //                         })
    //                     }
    //                 >
    //                     Log In
    //                 </button>
    //             </Stack>            
    //     </Stack>
    //     </div>
    // );
   

    return (
        <div className="content-layout">
            <h1 className="content__title">Admin Links</h1>
            <div className="content__body">
                <Stack direction='column' spacing={1}>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"                                 
                        options={nonProfitOptions}                        
                        sx={{ width: 300 }}
                        onChange={handleNonProfitChange}
                        renderInput={(params) => <TextField {...params} label="Name of Charity Organization" />}
                    />
                    <ListOfLinkAndName key="github" name="GitHub" LinkAndNameComponents={githubLinks} />
                    <ListOfLinkAndName key="references" name="References" LinkAndNameComponents={referencesLinks} />
                </Stack>
            </div>
        </div>
    );
}
    


