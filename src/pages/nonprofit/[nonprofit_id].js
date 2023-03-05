import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const NonProfit = dynamic(() => import('../../components/NonProfit/NonProfit'), {
    ssr: false
});

export default function NonProfitProfile() {
    const router = useRouter();
    const { nonprofit_id } = router.query;
  
    return (
        <NonProfit
          nonprofit_id={nonprofit_id}
        />
    );
}
