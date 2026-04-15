# Judging System Backend API Requirements

This document outlines the backend API endpoints needed to support the complete judging system implemented in the frontend. The frontend has been built with stubbed API calls and is ready for backend integration.

## Overview

The judging system supports a two-round judging process:
- **Round 1**: Video reviews where judges score teams based on 4-minute pitch videos
- **Round 2**: Live demos where finalist teams present to all judges

## Required API Endpoints

### 1. Judge Assignments API

#### GET `/api/judge/assignments/{judge_id}`
Get all hackathon assignments for a specific judge.

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: application/json`

**Response:**
```json
{
  "hackathons": [
    {
      "event_id": "2025_summer",
      "title": "2025 Summer Global Hackathon",
      "start_date": "2025-06-15T00:00:00Z",
      "end_date": "2025-06-17T00:00:00Z",
      "round1_teams": 8,
      "round2_teams": 3,
      "judging_status": {
        "round1": { "completed": 5, "total": 8 },
        "round2": { "completed": 0, "total": 3 }
      }
    }
  ]
}
```

### 2. Judge Teams API

#### GET `/api/judge/teams/{judge_id}/{event_id}`
Get teams assigned to a judge for a specific hackathon.

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: application/json`

**Response:**
```json
{
  "round1_teams": [
    {
      "id": "team_1",
      "name": "EcoTracker Solutions",
      "problem_statement": {
        "title": "Environmental Impact Tracking for Nonprofits",
        "nonprofit": "GreenEarth Foundation"
      },
      "members": [
        { "name": "Sarah Chen", "role": "Frontend Developer" },
        { "name": "Mike Rodriguez", "role": "Backend Developer" }
      ],
      "github_url": "https://github.com/team-ecotracker/nonprofit-tracker",
      "devpost_url": "https://devpost.com/software/ecotracker-solutions",
      "video_url": "https://youtube.com/watch?v=example1",
      "demo_time": null,
      "judged": false,
      "score": null
    }
  ],
  "round2_teams": [
    {
      "id": "team_1",
      "name": "EcoTracker Solutions",
      "problem_statement": {
        "title": "Environmental Impact Tracking for Nonprofits",
        "nonprofit": "GreenEarth Foundation"
      },
      "members": [
        { "name": "Sarah Chen", "role": "Frontend Developer" },
        { "name": "Mike Rodriguez", "role": "Backend Developer" }
      ],
      "github_url": "https://github.com/team-ecotracker/nonprofit-tracker",
      "devpost_url": "https://devpost.com/software/ecotracker-solutions",
      "demo_time": "2025-06-17T10:00:00Z",
      "room": "Main Hall",
      "judged": false,
      "score": null
    }
  ]
}
```

### 3. Team Details API

#### GET `/api/judge/team/{team_id}`
Get detailed information about a specific team for judging.

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: application/json`

**Response:**
```json
{
  "team": {
    "id": "team_1",
    "name": "EcoTracker Solutions",
    "description": "A comprehensive environmental impact tracking solution for nonprofits to monitor and report their sustainability initiatives.",
    "problem_statement": {
      "title": "Environmental Impact Tracking for Nonprofits",
      "description": "Many nonprofits struggle to track and quantify their environmental impact across various initiatives. They need a user-friendly platform to log activities, measure carbon footprint, and generate reports for stakeholders.",
      "nonprofit": "GreenEarth Foundation",
      "nonprofit_contact": "contact@greenearth.org"
    },
    "members": [
      { 
        "name": "Sarah Chen", 
        "role": "Frontend Developer", 
        "email": "sarah.chen@example.com",
        "github": "https://github.com/sarahchen"
      }
    ],
    "github_url": "https://github.com/team-ecotracker/nonprofit-tracker",
    "devpost_url": "https://devpost.com/software/ecotracker-solutions",
    "video_url": "https://youtube.com/watch?v=example1",
    "demo_url": "https://ecotracker-demo.herokuapp.com",
    "technologies": ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
    "features": [
      "Activity logging with carbon footprint calculation",
      "Interactive dashboard with data visualizations", 
      "Automated report generation",
      "Multi-user role management",
      "API integration with external carbon databases"
    ]
  }
}
```

### 4. Score Submission API

#### POST `/api/judge/score`
Submit or update a team score.

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "judge_id": "judge_user_id",
  "team_id": "team_1",
  "event_id": "2025_summer",
  "round": "round1",
  "scores": {
    "scopeImpact": 4,
    "scopeComplexity": 3,
    "documentationCode": 4,
    "documentationEase": 4,
    "polishWorkRemaining": 3,
    "polishCanUseToday": 2,
    "securityData": 3,
    "securityRole": 3,
    "total": 26
  },
  "submitted_at": "2025-01-24T14:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "score_id": "score_12345"
}
```

### 5. Judge Scores API

#### GET `/api/judge/scores/{judge_id}/{event_id}`
Get all scores submitted by a judge for a hackathon.

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: application/json`

**Response:**
```json
{
  "scores": [
    {
      "team_id": "team_2",
      "round": "round1",
      "scores": {
        "scopeImpact": 4,
        "scopeComplexity": 3,
        "documentationCode": 4,
        "documentationEase": 4,
        "polishWorkRemaining": 3,
        "polishCanUseToday": 2,
        "securityData": 3,
        "securityRole": 3,
        "total": 26
      },
      "submitted_at": "2025-01-24T14:30:00Z"
    }
  ]
}
```

### 6. Draft Score API

#### POST `/api/judge/draft`
Save draft scores (auto-save functionality).

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "judge_id": "judge_user_id",
  "team_id": "team_1",
  "event_id": "2025_summer",
  "round": "round1",
  "scores": {
    "scopeImpact": 4,
    "scopeComplexity": 3,
    "documentationCode": 4,
    "documentationEase": 4,
    "polishWorkRemaining": 3,
    "polishCanUseToday": 2,
    "securityData": 3,
    "securityRole": 3
  },
  "updated_at": "2025-01-24T14:30:00Z"
}
```

**Response:**
```json
{
  "success": true
}
```

## Admin API Extensions

The existing admin API needs extensions to support the new judging assignment functionality:

### 7. Team Assignment API

#### GET `/api/team/{event_id}`
Get teams for a specific hackathon (used in admin judging assignment).

**Headers:**
- `Authorization: Bearer {access_token}`
- `X-Org-Id: {org_id}`

**Response:**
```json
{
  "teams": [
    {
      "id": "team_1",
      "name": "EcoTracker Solutions",
      "members": [
        { "name": "Sarah Chen", "role": "Frontend Developer" }
      ],
      "problem_statement": {
        "title": "Environmental Impact Tracking for Nonprofits",
        "nonprofit": "GreenEarth Foundation"
      }
    }
  ]
}
```

## Database Schema Requirements

### Tables Needed

#### 1. `judge_assignments`
```sql
CREATE TABLE judge_assignments (
    id SERIAL PRIMARY KEY,
    judge_id VARCHAR(255) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    round VARCHAR(10) NOT NULL, -- 'round1' or 'round2'
    panel_id VARCHAR(255), -- For round1 panel assignments
    room VARCHAR(255), -- For in-person events
    demo_time TIMESTAMP, -- For round2 scheduling
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(judge_id, event_id, team_id, round)
);
```

#### 2. `judge_scores`
```sql
CREATE TABLE judge_scores (
    id SERIAL PRIMARY KEY,
    judge_id VARCHAR(255) NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    round VARCHAR(10) NOT NULL,
    scope_impact INTEGER CHECK (scope_impact >= 1 AND scope_impact <= 5),
    scope_complexity INTEGER CHECK (scope_complexity >= 1 AND scope_complexity <= 5),
    documentation_code INTEGER CHECK (documentation_code >= 1 AND documentation_code <= 5),
    documentation_ease INTEGER CHECK (documentation_ease >= 1 AND documentation_ease <= 5),
    polish_work_remaining INTEGER CHECK (polish_work_remaining >= 1 AND polish_work_remaining <= 5),
    polish_can_use_today INTEGER CHECK (polish_can_use_today >= 1 AND polish_can_use_today <= 5),
    security_data INTEGER CHECK (security_data >= 1 AND security_data <= 5),
    security_role INTEGER CHECK (security_role >= 1 AND security_role <= 5),
    total_score INTEGER,
    is_draft BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(judge_id, team_id, event_id, round, is_draft)
);
```

#### 3. `judge_panels` (for Round 1 organization)
```sql
CREATE TABLE judge_panels (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    panel_name VARCHAR(255) NOT NULL,
    room VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, panel_name)
);
```

## Business Logic Requirements

### 1. Judge Assignment Logic
- Judges can only see teams they're assigned to
- Round 1: Judges assigned to specific panels see only their panel's teams
- Round 2: All judges see all finalist teams
- Assignments are created by admins using the `/admin/judging` interface

### 2. Scoring Logic
- Each criterion scored 1-5 points
- Total score calculated automatically (max 40 points)
- Draft scores saved automatically every 2 seconds
- Final submission requires explicit action
- Judges can edit submitted scores

### 3. Progress Tracking
- Calculate completion percentage based on scored vs assigned teams
- Track both Round 1 and Round 2 progress separately
- Update progress in real-time as scores are submitted

### 4. Security Requirements
- Judge can only score teams they're assigned to
- Judge can only see their own scores
- Admin permissions required for assignment management
- All API calls require valid authentication tokens

## Integration Points

### Existing Systems
- **User Authentication**: Uses existing PropelAuth integration
- **Volunteer System**: Judges come from accepted judge applications in `/admin/volunteer`
- **Team System**: Integrates with existing team data from `/api/messages/teams`
- **Hackathon System**: Uses existing hackathon events from `/api/messages/hackathons`

### Frontend Files Created
- `/src/lib/judgeApi.js` - API service layer with all endpoint calls
- `/src/pages/judge/index.js` - Judge dashboard
- `/src/pages/judge/[event_id].js` - Hackathon judging interface
- `/src/pages/judge/[event_id]/team/[team_id].js` - Team scoring interface
- `/src/pages/admin/judging/index.js` - Admin judging management
- `/src/components/admin/JudgingRound1.js` - Round 1 admin interface
- `/src/components/admin/JudgingRound2.js` - Round 2 admin interface

### Judging Criteria (from `/about/judges`)
The scoring system implements the exact criteria from the judges page:

1. **Scope of Solution (10 points)**
   - Impact on Community (1-5 points)
   - Complexity of Problem Solved (1-5 points)

2. **Documentation (10 points)**
   - Code and UX Documentation (1-5 points)
   - Ease of Understanding (1-5 points)

3. **Polish (10 points)**
   - Work Remaining (1-5 points)
   - Can Use Today (1-5 points)

4. **Security (10 points)**
   - Data Protection (1-5 points)
   - Role-based Security (1-5 points)

## Testing Requirements

### Mock Data
The frontend includes comprehensive mock data in `judgeApi.js` for testing without backend. This includes:
- Sample hackathon assignments
- Sample team data with GitHub/DevPost links
- Sample scoring data
- Error handling scenarios

### API Testing
Test all endpoints with:
- Valid authentication tokens
- Invalid/expired tokens
- Missing required fields
- Invalid score ranges (outside 1-5)
- Duplicate submissions
- Cross-judge access attempts (should fail)

This completes the backend requirements for the judging system. The frontend is fully implemented and ready for integration once these APIs are built.