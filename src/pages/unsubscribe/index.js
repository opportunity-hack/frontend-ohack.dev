import dynamic from "next/dynamic";

const Unsubscribe = dynamic(
    () => import("../../components/Unsubscribe/Unsubscribe"),
    {
        ssr: false,
    }
);

// TODO: once MUI has been set up to render server side, pull outer markup from  NonProfitList back into here.
export default function UnsubscribeMe(props) {
    // Get email address if it was passed into GET request
    const email = props.email;

    console.log("Props: ", props);



    return <Unsubscribe email_address={email} />;
}

export async function getServerSideProps(context) {
    const email = context.query.email || null;

    return {
        props: { email }, // will be passed to the page component as props
    }
}