import { useState, useMemo } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Pagination, 
  Stack, 
  Divider, 
  Alert, 
  Chip,
  Button
} from '@mui/material';
import ProjectCard from './ProjectCard';
import FeaturedProjects from './FeaturedProjects/FeaturedProjects';
import { ProjectSearch, FilterBar } from './filters';
import { useAuthInfo } from "@propelauth/react";
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';
import InfoIcon from '@mui/icons-material/Info';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

export default function ProjectList({ initialProjects, events }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;
  const [filters, setFilters] = useState({
    status: null,
    skills: [],
    hasHelpers: false,
    beginnerFriendly: false,
    highImpact: false,
    featured: false,
    sortBy: 'rank'
  });
  
  const { user } = useAuthInfo();

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(project => {
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesTitle = project.title?.toLowerCase().includes(searchLower);
        const matchesDesc = project.description?.toLowerCase().includes(searchLower);
        const matchesSkills = project.skills?.some(skill => skill.toLowerCase().includes(searchLower));
        
        if (!(matchesTitle || matchesDesc || matchesSkills)) {
          return false;
        }
      }
      
      // Apply status filter
      if (filters.status && project.status !== filters.status) {
        return false;
      }
      
      // Apply helpers filter
      if (filters.hasHelpers && !project.helping?.length) {
        return false;
      }
      
      // Apply skills filter
      if (filters.skills?.length > 0 && !project.skills?.some(skill => 
        filters.skills.includes(skill))) {
        return false;
      }
      
      // Apply beginner friendly filter (based on tags or complexity field)
      if (filters.beginnerFriendly && 
          !(project.tags?.includes('beginner-friendly') || project.complexity === 'easy')) {
        return false;
      }
      
      // Apply high impact filter (based on impact field or tag)
      if (filters.highImpact && 
          !(project.tags?.includes('high-impact') || project.impact === 'high')) {
        return false;
      }
      
      // Apply featured filter
      if (filters.featured && !project.featured) {
        return false;
      }
      
      return true;
    });
  }, [initialProjects, searchQuery, filters]);

  // Apply sorting to filtered projects
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      switch(filters.sortBy) {
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'rank':
          return (b.rank || 0) - (a.rank || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'needHelp':
          // Projects needing help (no helpers or few helpers) come first
          const aHelpers = a.helping?.length || 0;
          const bHelpers = b.helping?.length || 0;
          return aHelpers - bHelpers;
        default:
          return (b.rank || 0) - (a.rank || 0);
      }
    });
  }, [filteredProjects, filters.sortBy]);

  // Get current page projects
  const currentProjects = useMemo(() => {
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    return sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
  }, [sortedProjects, currentPage, projectsPerPage]);

  // Calculate pages
  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get featured projects
  const featuredProjects = useMemo(() => {
    // First look for projects explicitly marked as featured
    const explicitlyFeatured = initialProjects.filter(p => p.featured);
    
    if (explicitlyFeatured.length >= 3) {
      return explicitlyFeatured.slice(0, 3);
    }
    
    // Otherwise, use active projects with highest rank
    const activeProjects = initialProjects.filter(p => 
      p.status !== 'production' && p.status !== 'post-hackathon'
    );
    
    return activeProjects
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, 3);
  }, [initialProjects]);

  // Get skill options from all projects
  const skillOptions = useMemo(() => {
    const skillSet = new Set();
    initialProjects.forEach(project => {
      project.skills?.forEach(skill => skillSet.add(skill));
    });
    return Array.from(skillSet).sort();
  }, [initialProjects]);

  // Handle skill filter changes
  const handleSkillFilter = (skill) => {
    const currentSkills = [...filters.skills];
    const skillIndex = currentSkills.indexOf(skill);
    
    if (skillIndex === -1) {
      currentSkills.push(skill);
    } else {
      currentSkills.splice(skillIndex, 1);
    }
    
    setFilters({
      ...filters,
      skills: currentSkills
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, mt: { xs: 8, md: 10 } }}>
      {!user && <LoginOrRegister />}

      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          Featured Projects
        </Typography>
        <FeaturedProjects projects={featuredProjects} />
      </Box>

      <Box sx={{ my: 4 }}>
        <Alert 
          severity="info" 
          icon={<VolunteerActivismIcon />}
          sx={{ mb: 3 }}
        >
          Opportunity Hack connects volunteers with nonprofits to create impactful tech solutions. 
          Find a project that matches your skills and interests to make a difference!
        </Alert>
        
        <ProjectSearch value={searchQuery} onChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1); // Reset to first page when search changes
        }} />
        
        <FilterBar 
          filters={filters} 
          onChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1); // Reset to first page when filters change
          }} 
        />
        
        {filters.skills.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Active Skill Filters:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filters.skills.map(skill => (
                <Chip 
                  key={skill}
                  label={skill}
                  onDelete={() => handleSkillFilter(skill)}
                  color="primary"
                />
              ))}
              <Button 
                variant="text" 
                size="small"
                onClick={() => setFilters({...filters, skills: []})}
              >
                Clear All
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography>
          Showing {sortedProjects.length === 0 ? 0 : (currentPage - 1) * projectsPerPage + 1}-
          {Math.min(currentPage * projectsPerPage, sortedProjects.length)} of {sortedProjects.length} projects
        </Typography>
        
        {skillOptions.length > 0 && (
          <Button 
            size="small" 
            startIcon={<InfoIcon />}
            onClick={() => {
              const dialog = document.createElement('dialog');
              dialog.style.padding = '20px';
              dialog.style.borderRadius = '8px';
              dialog.style.maxWidth = '80%';
              dialog.innerHTML = `
                <h3>Available Skills</h3>
                <p>Click on a skill to filter projects:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                  ${skillOptions.map(skill => 
                    `<button style="padding: 6px 12px; border-radius: 16px; border: 1px solid #ddd; background: ${filters.skills.includes(skill) ? '#3f51b5' : '#f5f5f5'}; color: ${filters.skills.includes(skill) ? 'white' : 'black'}; cursor: pointer;">${skill}</button>`
                  ).join('')}
                </div>
                <button style="padding: 8px 16px; background: #f5f5f5; border: none; border-radius: 4px; cursor: pointer;">Close</button>
              `;
              document.body.appendChild(dialog);
              
              const buttons = dialog.querySelectorAll('button');
              const closeButton = buttons[buttons.length - 1];
              
              // Add click handlers for skill buttons
              for (let i = 0; i < buttons.length - 1; i++) {
                buttons[i].addEventListener('click', () => {
                  handleSkillFilter(skillOptions[i]);
                  buttons[i].style.background = filters.skills.includes(skillOptions[i]) ? '#f5f5f5' : '#3f51b5';
                  buttons[i].style.color = filters.skills.includes(skillOptions[i]) ? 'black' : 'white';
                });
              }
              
              closeButton.addEventListener('click', () => {
                dialog.close();
                dialog.remove();
              });
              
              dialog.showModal();
            }}
          >
            Browse All Skills
          </Button>
        )}
      </Box>

      {sortedProjects.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {currentProjects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <ProjectCard
                  project={project}
                  hackathons={events}
                />
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ 
          py: 8, 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h5" gutterBottom>No matching projects found</Typography>
          <Typography color="text.secondary">
            Try adjusting your search or filters to find more projects
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchQuery('');
              setFilters({
                status: null,
                skills: [],
                hasHelpers: false,
                beginnerFriendly: false,
                highImpact: false,
                featured: false,
                sortBy: 'rank'
              });
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}
    </Box>
  );
}