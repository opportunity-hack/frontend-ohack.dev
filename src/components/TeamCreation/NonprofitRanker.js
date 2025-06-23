import React, { memo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MdDragHandle } from 'react-icons/md';

/**
 * Component for ranking selected nonprofits using drag and drop
 */
const NonprofitRanker = memo(({ selectedNonprofits, handleDragEnd }) => {
  return (
    <Box 
      sx={{ 
        p: 3, 
        border: '1px solid',
        borderColor: 'primary.light',
        borderRadius: 2,
        bgcolor: 'rgba(25, 118, 210, 0.04)'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <MdDragHandle style={{ marginRight: 8 }} /> Drag to Rank Your Nonprofit Choices
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Your first choice (#1) should be at the top of the list. Drag and drop to arrange the nonprofits 
        in your order of preference.
      </Typography>
      
      {selectedNonprofits.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="nonprofits">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {selectedNonprofits.map((nonprofit, index) => (
                  <Draggable
                    key={nonprofit.id.toString()}
                    draggableId={nonprofit.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          mb: 2,
                          boxShadow: 2,
                          "&:hover": {
                            boxShadow: 4,
                          },
                          border: '1px solid',
                          borderColor: index === 0 ? 'primary.main' : 'divider',
                          bgcolor: index === 0 ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                        }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <Box
                              {...provided.dragHandleProps}
                              sx={{ mr: 2, color: "text.secondary" }}
                            >
                              <MdDragHandle />
                            </Box>
                            <Chip
                              label={`#${index + 1}`}
                              color={index === 0 ? "primary" : "default"}
                              size="small"
                              sx={{ mr: 2, minWidth: 40 }}
                            />
                            <Box flexGrow={1}>
                              <Box display="flex" alignItems="center" mb={1}>
                                <Box 
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    mr: 2,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  <img 
                                    src={nonprofit.image || "/npo_placeholder.png"} 
                                    alt={nonprofit.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                                <Typography variant="h6" component="h4">
                                  {nonprofit.name}
                                </Typography>
                                {index === 0 && (
                                  <Chip 
                                    color="primary" 
                                    label="Top Choice!" 
                                    size="small"
                                    sx={{ 
                                      ml: 2,
                                      animation: 'pulse 1.5s infinite',
                                      '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.1)' },
                                        '100%': { transform: 'scale(1)' }
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {nonprofit.description || "Join this nonprofit's mission to make a positive social impact."}
                              </Typography>
                              {nonprofit.problem_statements && nonprofit.problem_statements.length > 0 && (
                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {nonprofit.problem_statements.map((problem, idx) => (
                                    <Chip 
                                      key={idx} 
                                      label={problem.displayTitle} 
                                      size="small" 
                                      variant="outlined" 
                                      sx={{ mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Alert severity="warning" sx={{ my: 2 }}>
          No nonprofits selected. Please go back and select at least one nonprofit.
        </Alert>
      )}
    </Box>
  );
});

NonprofitRanker.displayName = 'NonprofitRanker';

export default NonprofitRanker;