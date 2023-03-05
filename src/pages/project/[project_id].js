import dynamic from "next/dynamic";

const Project = dynamic(() => import("../../components/Project/Project"), {
  ssr: false
});

export default function ProjectPage() {
  return (
    <Project />
  );
}