import dynamic from 'next/dynamic';

const Admin = dynamic(() => import('../../components/admin/Admin'), {
    ssr:false,
});

export default function AdminPage ({ admin }) {    
    return(
        <Admin/>      
    );
};
