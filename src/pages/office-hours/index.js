import dynamic from 'next/dynamic';

const OfficeHours = dynamic(() => import('../../components/OfficeHours/OfficeHours'), {
    ssr: false,
});

export default function OfficeHour() {    
    
    return (
        <OfficeHours/>
    );
}


