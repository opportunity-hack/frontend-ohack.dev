import { useState, useMemo } from 'react';
import { Grid, Chip, Typography, Box } from '@mui/material';
import ProjectCard from './ProjectCard';
import FeaturedProjects from './FeaturedProjects/FeaturedProjects';
import { ProjectSearch, FilterBar } from './filters';
import { useAuthInfo } from "@propelauth/react";
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister';

export default function ProjectList({ initialProjects, events }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: null,
    skills: [],
    hasHelpers: false
  });
  
  const { user } = useAuthInfo();

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(project => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
        );
      }
      if (filters.status && project.status !== filters.status) {
        return false;
      }
      if (filters.hasHelpers && !project.helping?.length) {
        return false;
      }
      if (filters.skills?.length > 0 && !project.skills?.some(skill => 
        filters.skills.includes(skill))) {
        return false;
      }
      return true;
    }).sort((a, b) => (b.rank || 0) - (a.rank || 0));
  }, [initialProjects, searchQuery, filters]);

  const featuredProjects = useMemo(() => {
    const activeProjects = initialProjects.filter(p => 
      p.status !== 'production' && p.status !== 'post-hackathon'
    );
    return activeProjects
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, 3);
  }, [initialProjects]);

  return (
    <Box sx={{ p: 3, mt: 10}}>
      {!user && <LoginOrRegister />}

      <Typography variant="h4" gutterBottom>
        Featured Projects
      </Typography>
      <FeaturedProjects projects={featuredProjects} />

      <Box sx={{ my: 4 }}>
        <ProjectSearch value={searchQuery} onChange={setSearchQuery} />
        <FilterBar filters={filters} onChange={setFilters} />
      </Box>

      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <ProjectCard
              project={project}
              hackathons={events}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}