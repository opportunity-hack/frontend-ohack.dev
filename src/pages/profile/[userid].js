import dynamic from 'next/dynamic';

const PublicProfile = dynamic(() => import('../../components/Profile/PublicProfile'), {
    ssr: false
});

export default function PublicProfilePage(){
    
    return (
        <PublicProfile />    
    );
};
