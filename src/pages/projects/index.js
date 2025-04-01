import dynamic from 'next/dynamic';
import Head from 'next/head';

const ProjectList = dynamic(() => import('../../components/ProjectList/ProjectList'), {
  ssr: false
});

export default function Projects({ projects, hackathons, stats, topNonprofits }) {
  const title = "Open Source Projects for Social Impact | Opportunity Hack";
  const metaDescription = `Join our community of ${stats.volunteers}+ volunteers working on ${stats.total} open source projects to empower nonprofits. Accelerate your career while making a lasting impact with projects using ${stats.topSkills.join(', ')} and more.`;
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
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@opportunityhack" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_4.webp"
        />

        {/* Additional SEO tags */}
        <meta
          name="keywords"
          content={`social impact projects, tech for good, nonprofit tech solutions, volunteer coding, career growth, ${stats.topSkills.join(", ")}`}
        />
        <meta name="robots" content="index, follow" />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: title,
              description: metaDescription,
              url: canonicalUrl,
              numberOfItems: stats.total,
              mainEntity: {
                "@type": "Organization",
                name: "Opportunity Hack",
                url: "https://ohack.dev",
                logo: "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Dark_Blue.png",
                description:
                  "Empowering students, professionals, and nonprofits to collaboratively create sustainable tech solutions that drive social impact and foster learning.",
                mission:
                  "To empower students, professionals, and nonprofits to collaboratively create sustainable tech solutions that drive social impact and foster learning.",
                sameAs: [
                  "https://github.com/opportunity-hack",
                  "https://www.linkedin.com/company/opportunity-hack",
                  "https://twitter.com/opportunityhack",
                ],
              },
              itemListElement: projects.map((project, index) => ({
                "@type": "Project",
                position: index + 1,
                name: project.title,
                description: project.description,
                keywords: project.skills?.join(", ") || "",
                status: project.status,
                url: `https://ohack.dev/project/${project.id}`,
                provider: {
                  "@type": "Organization",
                  name: "Opportunity Hack",
                  url: "https://ohack.dev",
                },
                audience: {
                  "@type": "Audience",
                  audienceType:
                    "Software Developers, UX Designers, Data Scientists, Product Managers",
                },
              })),
            }),
          }}
        />
      </Head>
      <ProjectList initialProjects={projects} events={hackathons} />
    </>
  );
}

export async function getStaticProps() {
  try {
    // Use environment variable for API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    
    // Fetch data in parallel for better performance
    const [projectsRes, hackathonsRes, volunteersRes] = await Promise.all([
      fetch(`${apiUrl}/api/messages/problem_statements`),
      fetch(`${apiUrl}/api/messages/hackathons`),
      fetch(`${apiUrl}/api/messages/volunteer_count`) // Assuming this endpoint exists
        .then(res => res.json())
        .catch(() => ({ count: 500 })) // Fallback volunteer count if endpoint doesn't exist
    ]);

    const projectsData = await projectsRes.json();
    const hackathonsData = await hackathonsRes.json();
    
    // Process the data for better organization
    const projects = projectsData.problem_statements || [];
    
    // Add beginner-friendly and impact flags for newer projects if they don't exist
    const enhancedProjects = projects.map(project => {
      // Check if it's a good project for beginners (based on skills or complexity)
      const isBeginnerFriendly = 
        project.skills?.some(skill => ['html', 'css', 'javascript', 'web'].includes(skill.toLowerCase())) ||
        project.complexity === 'easy';
      
      // Determine social impact
      const hasHighImpact = 
        project.tags?.includes('high-impact') || 
        project.impact === 'high' ||
        project.description?.toLowerCase().includes('impact') ||
        project.description?.toLowerCase().includes('vulnerable');

      return {
        ...project,
        tags: [...(project.tags || [])],
        complexity: project.complexity || (isBeginnerFriendly ? 'easy' : 'medium'),
        impact: project.impact || (hasHighImpact ? 'high' : 'medium')
      };
    });
    
    // Extract statistics for meta tags and filtering
    const topNonprofits = projects
      .filter(p => p.nonprofit_name)
      .map(p => p.nonprofit_name)
      .filter((name, index, self) => self.indexOf(name) === index)
      .slice(0, 5);
    
    // Calculate statistics for meta description
    const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'hackathon' || p.status === 'concept').length,
      completed: projects.filter(p => p.status === 'production' || p.status === 'post-hackathon').length,
      topSkills: getTopSkills(projects),
      beginnerFriendly: projects.filter(p => p.complexity === 'easy' || p.tags?.includes('beginner-friendly')).length,
      highImpact: projects.filter(p => p.impact === 'high' || p.tags?.includes('high-impact')).length,
      volunteers: volunteersRes.count || 500, // Fallback to 500 if count not available
      topNonprofits
    };

    return {
      props: {
        projects: enhancedProjects,
        hackathons: hackathonsData.hackathons || [],
        stats,
        topNonprofits
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        projects: [],
        hackathons: [],
        stats: {
          total: 0,
          active: 0,
          completed: 0,
          topSkills: [],
          volunteers: 500,
          beginnerFriendly: 0,
          highImpact: 0
        },
        topNonprofits: []
      },
      revalidate: 60 // Try again sooner if there was an error
    };
  }
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
