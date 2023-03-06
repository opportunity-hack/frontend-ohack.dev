import dynamic from 'next/dynamic'

const NonProfitList = dynamic(() => import('../../components/NonProfitList/NonProfitList'), {
    ssr: false,
});

// TODO: once MUI has been set up to render server side, pull outer markup from  NonProfitList back into here.
export default function NonProfits() {
    return (
      <NonProfitList/>      
    );
}
