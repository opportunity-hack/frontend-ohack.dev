import dynamic from 'next/dynamic';

const Profile = dynamic(() => import('../../components/Profile/Profile'), {
    ssr: false,
});

export default function ProfilePage() {
    return (
        <Profile />
    );
}