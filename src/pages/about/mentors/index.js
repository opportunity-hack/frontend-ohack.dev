import dynamic from "next/dynamic";

const Mentorship = dynamic(
    () => import("../../../components/About/Mentorship/Mentorship"),
    {
        ssr: false,
    }
);


export default function Mentors() {        
    return <Mentorship />;
    
}
