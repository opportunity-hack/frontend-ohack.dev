import dynamic from 'next/dynamic';

const MyProfile = dynamic(() => import('../../components/MyProfile/MyProfile'), {
    ssr: false
});


export default function viewMyProfile() {
    return (
        <MyProfile />
    );
}
