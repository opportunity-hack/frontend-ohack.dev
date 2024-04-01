import dynamic from 'next/dynamic';

const CertInfoIndex = dynamic(() => import('../../components/Certificate/CertInfoIndex'), {
    ssr: false
});

export default function CertInfoPage(){
    
    return (
        <CertInfoIndex />    
    );
};
