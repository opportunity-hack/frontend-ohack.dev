import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const SlackSignup = dynamic(() => import('../../components/SlackSignup/SlackSignup'), {
    ssr: false,
});

export default function Signup() {
    // Get the previous page from the query string
    const router = useRouter();
    const previousPage = router.query.previousPage;
    
    return (
        <SlackSignup previousPage={previousPage} />
    );
}


