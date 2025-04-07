# Opportunity Hack: Hacker Registration Form Guide

## Overview

This guide outlines recommendations for updating Opportunity Hack's application forms to include a comprehensive hacker registration form that accommodates participants from diverse backgrounds, skill levels, and areas of study. As a Qualifying Charitable Organization (QCO) in Arizona, Opportunity Hack needs to collect relevant data on the people they support through this hackathon.

## Why Update the Registration Form?

Opportunity Hack brings together participants from varied backgrounds:
- Students from different disciplines (not just computer science)
- Working professionals
- Community members with diverse technical and non-technical skills
- People with varying levels of hackathon experience

The current application system should be enhanced to better capture this diversity and support Opportunity Hack's inclusive mission while collecting necessary data for QCO reporting requirements.

## Recommended Updates

### 1. Basic Profile Enhancements

**Current Structure:**
- Email, Full Name, School, Graduation Year, Gender
- Description (skills/role)
- Essay question

**Recommended Additions:**
- **Participant Type** (select)
  - Student
  - Professional
  - Educator
  - Community Member
  - Other (with text field)
  
- **Experience Level** (select)
  - First-time hacker
  - Some hackathon experience (1-3 events)
  - Experienced hacker (4+ events)
  
- **Primary Role/Skill Set** (select, multiple allowed)
  - Software Development (Frontend, Backend, Mobile, etc.)
  - Design (UI/UX, Graphics, etc.)
  - Data Science/Analytics
  - Business/Project Management
  - Domain Expert (Healthcare, Education, Environment, etc.)
  - Other (with text field)

- **Modify "School" Field** to "School/Organization" to be more inclusive
  - Add employer options to the autocomplete database

### 2. Arizona QCO Data Collection

Add fields to meet QCO reporting requirements:

- **Arizona Residency** (select)
  - Arizona Resident
  - Non-Arizona Resident
  
- **County** (for Arizona residents, select)
  - Maricopa
  - Pima
  - etc. (all Arizona counties)

- **Age Range** (select)
  - Under 18
  - 18-24
  - 25-34
  - 35-44
  - 45-54
  - 55+

- **How did you hear about Opportunity Hack?** (select)
  - School/University
  - Employer
  - Social Media
  - Friend/Colleague
  - Previous Participant
  - Nonprofit Organization
  - Other (with text field)

### 3. Social Impact Focus

Add fields to capture participants' interest in social impact:

- **Social Causes Interest** (select, multiple allowed)
  - Education
  - Healthcare
  - Environment
  - Economic Opportunity
  - Community Development
  - Accessibility/Inclusion
  - Other (with text field)
  
- **Social Impact Experience** (textarea, optional)
  - Prompt: "Share any previous experience with social impact projects or nonprofits"

- **Motivation** (textarea, optional)
  - Prompt: "What motivates you to participate in Opportunity Hack? What impact do you hope to create?"

### 4. Team Formation Support

Enhance team formation functionality:

- **Team Status** (select)
  - I have a team (with team code field)
  - I'm looking for team members (with skill sets needed field)
  - I'd like to be matched with a team
  
- **Team Matching Preferences** (when "match me" is selected)
  - Preferred team size
  - Preferred skill sets to work with
  - Preferred social cause areas

### 5. Workshop Interest

Add options for workshop participation:

- **Workshop Interest** (checkbox list)
  - Pre-hackathon skill-building workshops
  - During-event technical sessions
  - Social impact design thinking

### 6. Confirmation Form Adaptations

Update the post-acceptance confirmation form:

- **Add Participation Mode** (select)
  - In-person
  - Remote
  - Hybrid

- **Skill Showcase Field** (textarea, optional)
  - Prompt: "Share a link to a project, portfolio, or work you're proud of"
  
- **Nonprofit Preference** (if applicable)
  - Allow participants to rank preferred nonprofit challenges

- **Post-Hackathon Involvement** (checkbox)
  - Interest in continuing project development after the event
  - Willingness to be contacted by nonprofits for future opportunities
  
- **Tax Credit Information** (for Arizona residents)
  - Checkbox for "I'd like to receive information about Arizona tax credits for supporting Opportunity Hack"

## Implementation Considerations

### Database Schema Updates

```javascript
// Add to profile section
profile: {
  // Existing fields
  name: String,
  school: String,  // Rename field label to "School/Organization"
  // ...
  
  // New fields
  participantType: {
    type: String,
    enum: ['STUDENT', 'PROFESSIONAL', 'EDUCATOR', 'COMMUNITY', 'OTHER']
  },
  participantTypeOther: String,
  experienceLevel: String,
  primaryRoles: [String],
  
  // Arizona QCO data
  arizonaResident: Boolean,
  county: String,
  ageRange: String,
  referralSource: String,
  referralSourceOther: String,
  
  // Social impact
  socialCauses: [String],
  socialImpactExperience: String,
  motivation: String,
  
  // Team formation
  teamStatus: String,
  teamMatchingPreferences: {
    preferredSize: Number,
    preferredSkills: [String],
    preferredCauses: [String]
  },
  
  // Workshop interest
  workshopInterests: [String],
  
  // Tax credit
  interestedInTaxCredit: Boolean
}
```

### Status Flow Adaptations

Consider adding a "Matched" status that indicates when a participant has been matched with a team, particularly for participants who selected "I'd like to be matched with a team."

### Admin Dashboard Enhancements

Update the admin dashboard to:
- Filter participants by skills, causes, and experience level
- Generate team matching recommendations
- View team composition and balance stats
- Generate QCO reports with participant demographics
- Track Arizona resident participation for tax credit purposes

## QCO Reporting Features

Add specific functionality to help with QCO reporting:

- **Export QCO Data** button in admin dashboard to generate reports for:
  - Total participants by county
  - Age distribution of participants
  - Impact metrics (number of projects completed, nonprofits served)
  - Post-event continuation statistics

- **Tax Credit Documentation** generation for eligible Arizona participants

## Phased Implementation Approach

1. **Phase 1**: Update basic profile fields and add Arizona QCO data collection
2. **Phase 2**: Implement social impact focus fields and team matching
3. **Phase 3**: Add workshop integration and QCO reporting features

## Migration Considerations

When implementing these changes:
1. Ensure backward compatibility with existing user data
2. Consider whether existing users need to update their profiles
3. Test the form with diverse user groups (students, professionals, etc.)
4. Provide clear explanations of new fields in the UI
5. Ensure data collection complies with privacy regulations

## Conclusion

These enhancements will help Opportunity Hack better accommodate diverse participants while supporting its mission as an Arizona QCO. The updated registration system will facilitate more effective team formation, provide better data for event organizers, and support the organization's reporting requirements.