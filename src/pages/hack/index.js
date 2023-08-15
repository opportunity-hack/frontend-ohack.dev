import dynamic from 'next/dynamic';

const HackathonIndex = dynamic(() => import('../../components/Hackathon/HackathonIndex'), {
    ssr: false
});

export default function HackList() {      
    return (
        <HackathonIndex />
    );
}


