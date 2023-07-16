import dynamic from "next/dynamic";

const AboutUs = dynamic(
    () => import("../../components/About/AboutUs"),
    {
        ssr: false,
    }
);


export default function AboutUsPage() {        
    return <AboutUs />;
    
}
