import React, { memo } from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import NonprofitSelector from './NonprofitSelector';
import NonprofitRanker from './NonprofitRanker';
import TeamMemberManager from './TeamMemberManager';
import CommentsSection from './CommentsSection';

/**
 * Nonprofit selection and team member step (step 3)
 */
const NonprofitSelectionStep = memo(({
  rankingMode,
  searchTerm,
  filteredNonprofits,
  selectedNonprofits,
  handleSearchChange,
  toggleNonprofitSelection,
  clearSearch,
  proceedToRanking,
  backToSelection,
  handleDragEnd,
  teamMembers,
  memberInput,
  setMemberInput,  
  handleAddTeamMember,
  handleRemoveTeamMember,
  comments,
  setComments,
  slackUsers,
  error
}) => {
  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "primary.main", fontWeight: 600, mb: 3 }}
      >
        Select and Rank Nonprofits You're Excited to Support! 🎉
      </Typography>

      <Typography variant="body1" paragraph>
        Your team will be working to create tech solutions that directly impact
        these amazing organizations. First select the nonprofits you're
        interested in, then rank them in your order of preference!
      </Typography>

      {/* Selection/Ranking Tabs */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", mb: 3 }}>
          <Button
            variant={rankingMode === "select" ? "contained" : "outlined"}
            onClick={backToSelection}
            sx={{
              flexGrow: 1,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              opacity: rankingMode === "select" ? 1 : 0.7,
            }}
          >
            1. Select Nonprofits
          </Button>
          <Button
            variant={rankingMode === "rank" ? "contained" : "outlined"}
            onClick={proceedToRanking}
            disabled={selectedNonprofits.length === 0}
            sx={{
              flexGrow: 1,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              opacity:
                rankingMode === "rank" || selectedNonprofits.length === 0
                  ? 1
                  : 0.7,
            }}
          >
            2. Rank Your Choices ({selectedNonprofits.length})
          </Button>
        </Box>

        {/* Selection Mode */}
        {rankingMode === "select" && (
          <NonprofitSelector
            searchTerm={searchTerm}
            filteredNonprofits={filteredNonprofits}
            selectedNonprofits={selectedNonprofits}
            handleSearchChange={handleSearchChange}
            toggleNonprofitSelection={toggleNonprofitSelection}
            clearSearch={clearSearch}
            proceedToRanking={proceedToRanking}
          />
        )}

        {/* Ranking Mode */}
        {rankingMode === "rank" && (
          <NonprofitRanker
            selectedNonprofits={selectedNonprofits}
            handleDragEnd={handleDragEnd}
          />
        )}
      </Box>

      <Box mt={5}>
        <TeamMemberManager
          teamMembers={teamMembers}
          memberInput={memberInput}
          setMemberInput={setMemberInput}          
          handleAddTeamMember={handleAddTeamMember}
          handleRemoveTeamMember={handleRemoveTeamMember}
          slackUsers={slackUsers}
          error={error}
        />

        <CommentsSection comments={comments} setComments={setComments} />
      </Box>
    </Box>
  );
});

NonprofitSelectionStep.displayName = 'NonprofitSelectionStep';

export default NonprofitSelectionStep;