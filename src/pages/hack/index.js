import dynamic from 'next/dynamic';

const HackathonIndex = dynamic(() => import('../../components/Hackathon/HackathonIndex'), {
    ssr: process.env.NODE_ENV === 'production'
});

export default function HackList() {      
    return (
        <HackathonIndex />
    );
}


