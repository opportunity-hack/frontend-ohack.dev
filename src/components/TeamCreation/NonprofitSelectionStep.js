import React, { memo } from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import NonprofitSelector from './NonprofitSelector';
import NonprofitRanker from './NonprofitRanker';
import TeamMemberManager from './TeamMemberManager';
import CommentsSection from './CommentsSection';

/**
 * Nonprofit selection and team member step (step 3).
 *
 * Selection and ranking share one surface: the ranked list appears the moment a
 * nonprofit is picked and updates live, so ranking can't be missed or skipped.
 */
const NonprofitSelectionStep = memo(({
  searchTerm,
  filteredNonprofits,
  selectedNonprofits,
  handleSearchChange,
  toggleNonprofitSelection,
  clearSearch,
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
  const hasSelections = selectedNonprofits.length > 0;

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
        these amazing organizations. Pick the nonprofits you're interested in
        below — each one you choose drops into your ranked list, where you can
        drag them into your order of preference.
      </Typography>

      <Box sx={{ mb: 4 }}>
        {/* Live ranked list — appears as soon as anything is selected */}
        {hasSelections && (
          <Box sx={{ mb: 3 }}>
            <NonprofitRanker
              selectedNonprofits={selectedNonprofits}
              handleDragEnd={handleDragEnd}
              onRemove={toggleNonprofitSelection}
            />
          </Box>
        )}

        {/* Browse + add (always visible) */}
        <NonprofitSelector
          searchTerm={searchTerm}
          filteredNonprofits={filteredNonprofits}
          selectedNonprofits={selectedNonprofits}
          handleSearchChange={handleSearchChange}
          toggleNonprofitSelection={toggleNonprofitSelection}
          clearSearch={clearSearch}
        />
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
