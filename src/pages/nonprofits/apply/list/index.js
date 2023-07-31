import dynamic from 'next/dynamic';

const NonProfitApplyList = dynamic(() =>  import('../../../../components/NonProfitApply/NonProfitApplyList'), {
    ssr: false
});


export default function ApplyList() {
    return (     
        <NonProfitApplyList/>     
    );
}
