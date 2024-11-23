import dynamic from 'next/dynamic';
import Head from 'next/head';

const ProjectList = dynamic(() => import('../../components/ProjectList/ProjectList'), {
  ssr: false
});

export default function Projects({ projects, hackathons, stats }) {
  const title = "Open Source Projects for Nonprofits | Opportunity Hack";
  const metaDescription = `Browse ${stats.total} open source projects (${stats.active} active, ${stats.completed} completed) to help nonprofits. Projects include ${stats.topSkills.join(', ')} and more.`;
  const canonicalUrl = "https://ohack.dev/projects";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@opportunityhack" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp" />

        {/* Additional SEO tags */}
        <meta name="keywords" content={`nonprofit projects, open source, volunteer coding, ${stats.topSkills.join(', ')}`} />
        <meta name="robots" content="index, follow" />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": title,
              "description": metaDescription,
              "url": canonicalUrl,
              "numberOfItems": stats.total,
              "itemListElement": projects.map((project, index) => ({
                "@type": "Course",
                "position": index + 1,
                "name": project.title,
                "description": project.description,
                "provider": {
                  "@type": "Organization",
                  "name": "Opportunity Hack",
                  "url": "https://ohack.dev"
                }
              }))
            })
          }}
        />
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

  // Calculate statistics for meta description
  const stats = {
    total: projectsData.problem_statements.length,
    active: projectsData.problem_statements.filter(p => p.status === 'hackathon' || p.status === 'concept').length,
    completed: projectsData.problem_statements.filter(p => p.status === 'production' || p.status === 'post-hackathon').length,
    topSkills: getTopSkills(projectsData.problem_statements)
  };

  return {
    props: {
      projects: projectsData.problem_statements || [],
      hackathons: hackathonsData.hackathons || [],
      stats
    },
    revalidate: 3600
  };
}

// Helper function to get top skills across all projects
function getTopSkills(projects) {
  const skillCount = {};
  projects.forEach(project => {
    project.skills?.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });
  
  return Object.entries(skillCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([skill]) => skill);
}
