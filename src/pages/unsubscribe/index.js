import dynamic from "next/dynamic";

const Unsubscribe = dynamic(
    () => import("../../components/Unsubscribe/Unsubscribe"),
    {
        ssr: false,
    }
);

// TODO: once MUI has been set up to render server side, pull outer markup from  NonProfitList back into here.
export default function UnsubscribeMe() {
    return <Unsubscribe />;
}
