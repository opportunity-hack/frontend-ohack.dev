import dynamic from 'next/dynamic';

const SponsorIndex = dynamic(() => import('../../../components/Hackathon/SponsorIndex'), {
    ssr: false
});

export default function SponsorIndexList() {      
    return (
        <SponsorIndex />
    );
}


