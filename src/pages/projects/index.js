import dynamic from 'next/dynamic';
import Head from 'next/head';

const ProjectList = dynamic(() => import('../../components/ProjectList/ProjectList'), {
  ssr: false
});

export default function Projects({ projects, hackathons }) {
  const title = "Projects | Opportunity Hack";
  const metaDescription = `Browse ${projects.length} open source projects to help nonprofits`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        
      </Head>
      <ProjectList initialProjects={projects} events={hackathons} />
    </>
  );
}

export async function getStaticProps() {
  const [projectsRes, hackathonsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`),
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathons`)
  ]);

  const projectsData = await projectsRes.json();
  const hackathonsData = await hackathonsRes.json();

  return {
    props: {
      projects: projectsData.problem_statements || [],
      hackathons: hackathonsData.hackathons || []
    },
    revalidate: 3600 // Revalidate every hour
  };
}
