import React, { useState, useCallback, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Box,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { trackEvent } from '../../lib/ga'; // Adjust this import path as necessary
import { debounce } from 'lodash';

// Improved helper function to safely extract text content from React elements
const extractTextContent = (element) => {
  if (typeof element === 'string') {
    return element;
  }
  if (Array.isArray(element)) {
    return element.map(extractTextContent).join(' ');
  }
  if (React.isValidElement(element)) {
    const { children, ...props } = element.props;
    const childrenText = children ? extractTextContent(children) : '';
    const propsText = Object.values(props)
      .filter(prop => typeof prop === 'string')
      .join(' ');
    return `${childrenText} ${propsText}`.trim();
  }
  if (typeof element === 'object' && element !== null) {
    return Object.values(element)
      .filter(value => typeof value === 'string')
      .join(' ');
  }
  return '';
};

const FAQItem = ({ item, expanded, onChange, onExpand, questionFontSize, answerFontSize }) => (
  <Accordion 
    expanded={expanded} 
    onChange={(event, isExpanded) => {
      onChange(event, isExpanded);
      if (isExpanded) {
        onExpand(item.question);
      }
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel-content"
      id="panel-header"
    >
      <Typography sx={{ display: 'flex', alignItems: 'center', fontSize: questionFontSize || '1.2rem', fontWeight: 600 }}>
        <span style={{ marginRight: '8px', fontSize: '1.5rem' }}>{item.icon}</span>
        {item.question}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      {typeof item.answer === 'string' ? (
        <Typography sx={{ fontSize: answerFontSize || '1.1rem' }}>{item.answer}</Typography>
      ) : (
        <Box sx={{ fontSize: answerFontSize || '1.1rem' }}>{item.answer}</Box>
      )}
    </AccordionDetails>
  </Accordion>
);

export default function InteractiveFAQ({ faqData, title = "FAQ", questionFontSize = '1.2rem', answerFontSize = '1.1rem', searchTerm: externalSearchTerm }) {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleExpand = (question) => {
    // Track event for both Google Analytics and Facebook Pixel
    trackEvent({
      action: "faq_item_expanded",
      params: {
        faq_question: question
      }
    });
  };

  const trackSearch = (term) => {
    if (term.length > 0) {
      // Track event for both Google Analytics and Facebook Pixel
      trackEvent({
        action: "faq_search",
        params: {
          search_term: term
        }
      });
    }
  };

  const debouncedTrackSearch = useCallback(debounce(trackSearch, 300), []);

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    debouncedTrackSearch(newSearchTerm);
  };

  const filteredFAQ = faqData.filter(item => {
    const questionMatch = item.question.toLowerCase().includes(searchTerm.toLowerCase());
    const answerText = extractTextContent(item.answer).toLowerCase();
    const answerMatch = answerText.includes(searchTerm.toLowerCase());
    return questionMatch || answerMatch;
  });

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 4, scrollMarginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontSize: questionFontSize, fontWeight: 700 }}>{title}</Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search FAQ..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: '2rem' }} />
            </InputAdornment>
          ),
          style: { fontSize: questionFontSize }
        }}
        InputLabelProps={{ style: { fontSize: questionFontSize } }}
      />
      <Box>
        {filteredFAQ.map((item, index) => (
          <FAQItem
            key={index}
            item={item}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            onExpand={handleExpand}
            questionFontSize={questionFontSize}
            answerFontSize={answerFontSize}
          />
        ))}
      </Box>
      {filteredFAQ.length === 0 && (
        <Typography align="center" color="text.secondary" sx={{ mt: 4, fontSize: answerFontSize }}>
          No matching questions found.
        </Typography>
      )}
    </Box>
  );
}