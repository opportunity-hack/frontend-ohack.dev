import React from 'react';
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';

import { AccordionContainer, AccordionTitle } from "../ProblemStatement/styles";

/**
 * Component that renders either accordion (large screens) or tabs (small screens) 
 * to display problem statement content sections
 */
export default function ProblemStatementContent({
  sections,
  isLargeScreen,
  expanded,
  handleChange,
  tabValue,
  handleTabChange
}) {
  // Accordion for large screens
  const accordionContent = sections?.map((item) => (
    <Accordion
      key={item.label}
      expanded={expanded === item.label}
      onChange={handleChange(item.label)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${item.label}-content`}
        id={`${item.label}-header`}
      >
        <AccordionTitle>
          {item.icon}
          {item.label}  
        </AccordionTitle>
        {item.description}
      </AccordionSummary>
      <Stack marginLeft={2}>
        {item.content}                    
      </Stack>          
    </Accordion>
  ));

  // Tabs for small screens
  const tabsContent = (
    <TabContext allowScrollButtonsMobile scrollButtons={true} value={tabValue}>          
      <TabList 
        allowScrollButtonsMobile 
        scrollButtons={true} 
        onChange={handleTabChange} 
        aria-label="problem statement content tabs"
      >              
        {sections.map(item => (
          <Tab 
            key={item.label}
            onClick={handleChange(item.label)} 
            sx={{ width: "50px" }} 
            icon={item.icon} 
            label={item.label} 
            value={item.label} 
          />
        ))}                        
      </TabList>
      {sections.map(item => (
        <TabPanel  
          key={item.label}
          sx={{ padding: 0, margin: 0, width: "100%" }} 
          value={item.label}
        >                    
          {item.content}         
        </TabPanel>
      ))}
    </TabContext>
  );

  return (
    isLargeScreen ? 
      <AccordionContainer>
        {accordionContent}
      </AccordionContainer> 
      : 
      tabsContent
  );
}
