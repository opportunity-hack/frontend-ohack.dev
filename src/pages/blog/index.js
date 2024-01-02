import dynamic from "next/dynamic";

const Blog = dynamic(
    () => import("../../components/Blog/BlogPage"),
    {
        ssr: false,
    }
);


export default function ABlogPage() {        
    return <Blog />;    
}
