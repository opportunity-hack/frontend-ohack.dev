/**
 * Test file to verify that form scroll behavior is correctly implemented
 * in all application pages
 */

describe('Form Scroll Behavior', () => {
  test('should contain scroll behavior in hacker application handleNext', () => {
    const fs = require('fs');
    const path = require('path');
    
    const hackerAppPath = path.join(__dirname, '../pages/hack/[event_id]/hacker-application.js');
    const content = fs.readFileSync(hackerAppPath, 'utf8');
    
    // Check that handleNext contains scroll behavior
    expect(content).toMatch(/handleNext.*scrollIntoView.*behavior.*smooth/s);
    expect(content).toMatch(/handleBack.*scrollIntoView.*behavior.*smooth/s);
  });

  test('should contain scroll behavior in mentor application handleNext', () => {
    const fs = require('fs');
    const path = require('path');
    
    const mentorAppPath = path.join(__dirname, '../pages/hack/[event_id]/mentor-application.js');
    const content = fs.readFileSync(mentorAppPath, 'utf8');
    
    // Check that handleNext contains scroll behavior
    expect(content).toMatch(/handleNext.*scrollIntoView.*behavior.*smooth/s);
    expect(content).toMatch(/handleBack.*scrollIntoView.*behavior.*smooth/s);
  });

  test('should contain scroll behavior in volunteer application handleNext', () => {
    const fs = require('fs');
    const path = require('path');
    
    const volunteerAppPath = path.join(__dirname, '../pages/hack/[event_id]/volunteer-application.js');
    const content = fs.readFileSync(volunteerAppPath, 'utf8');
    
    // Check that handleNext contains scroll behavior
    expect(content).toMatch(/handleNext.*scrollIntoView.*behavior.*smooth/s);
    expect(content).toMatch(/handleBack.*scrollIntoView.*behavior.*smooth/s);
  });

  test('should contain scroll behavior in sponsor application handleNext', () => {
    const fs = require('fs');
    const path = require('path');
    
    const sponsorAppPath = path.join(__dirname, '../pages/hack/[event_id]/sponsor-application.js');
    const content = fs.readFileSync(sponsorAppPath, 'utf8');
    
    // Check that handleNext contains scroll behavior
    expect(content).toMatch(/handleNext.*scrollIntoView.*behavior.*smooth/s);
    expect(content).toMatch(/handleBack.*scrollIntoView.*behavior.*smooth/s);
  });

  test('should contain scroll behavior in judge application handleNext', () => {
    const fs = require('fs');
    const path = require('path');
    
    const judgeAppPath = path.join(__dirname, '../pages/hack/[event_id]/judge-application.js');
    const content = fs.readFileSync(judgeAppPath, 'utf8');
    
    // Check that handleNext contains scroll behavior
    expect(content).toMatch(/handleNext.*scrollIntoView.*behavior.*smooth/s);
    expect(content).toMatch(/handleBack.*scrollIntoView.*behavior.*smooth/s);
  });

  test('scroll behavior should use smooth animation and start block positioning', () => {
    const fs = require('fs');
    const path = require('path');
    
    const applicationFiles = [
      '../pages/hack/[event_id]/hacker-application.js',
      '../pages/hack/[event_id]/mentor-application.js',
      '../pages/hack/[event_id]/volunteer-application.js',
      '../pages/hack/[event_id]/sponsor-application.js',
      '../pages/hack/[event_id]/judge-application.js'
    ];
    
    applicationFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Verify proper scroll configuration (handle both single and double quotes)
      expect(content).toMatch(/behavior.*smooth/);
      expect(content).toMatch(/block.*start/);
      expect(content).toMatch(/formRef\?\.current/);
    });
  });

  test('should contain scroll behavior after form submission success', () => {
    const fs = require('fs');
    const path = require('path');
    
    const applicationFiles = [
      '../pages/hack/[event_id]/hacker-application.js',
      '../pages/hack/[event_id]/mentor-application.js',
      '../pages/hack/[event_id]/volunteer-application.js',
      '../pages/hack/[event_id]/sponsor-application.js',
      '../pages/hack/[event_id]/judge-application.js'
    ];
    
    applicationFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Verify scroll behavior is triggered after setSuccess(true) - more flexible regex
      expect(content).toMatch(/setSuccess\(true\);[\s\S]*?scrollIntoView[\s\S]*?behavior.*smooth/);
      // Also verify the comment explaining the behavior
      expect(content).toMatch(/Scroll to top of form to show.*Application Submitted/);
    });
  });
});