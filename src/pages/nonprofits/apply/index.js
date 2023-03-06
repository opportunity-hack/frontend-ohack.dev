import dynamic from 'next/dynamic';

const NonProfitApply = dynamic(() =>  import('../../../components/NonProfitApply/NonProfitApply'), {
    ssr: false
});

export default function Apply() {
    return (
        <NonProfitApply/>
    );
}