
import Grid from '@mui/material/Grid';
import { TitleContainer, LayoutContainer, ProjectsContainer, LinkStyled} from '../../components/Certificate/styles';
import { useEffect } from 'react';
import { useState } from 'react';
import dynamic from 'next/dynamic';


const Certificate = dynamic(() => import('../../components/Certificate/Certificate'), {
    ssr: false
});


export default function CertInfoPage(){
    const [certInfos, setCertInfos] = useState([]);

    // Call backend /api/certificates/rcent to get recent certificates
    useEffect(() => {
        // Make call to backend to get certificate info
        fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/certificates/recent`)
        .then(response => response.json())
        .then(data => setCertInfos(data.certs));
    }
    , []);

    return (
            <LayoutContainer key="certificate" container>
            <ProjectsContainer container style={{ marginTop: '2em'}} spacing={0.5}>                                             
            { 
                
                certInfos.map((certInfo) => {
                return (
                  <Certificate key={certInfo.file_id} certInfo={certInfo} />
                );
                })    
            }
            </ProjectsContainer>
            </LayoutContainer>
        
    );
};
