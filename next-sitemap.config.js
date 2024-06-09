

module.exports = {
    siteUrl: process.env.SITE_URL || 'https://www.ohack.dev',
    generateRobotsTxt: true, 
    exclude: [ '/admin', '/profile', '/nonprofit/[nonprofit_id]', '/hackathon/[hackathon_id]', '/project/[project_id]', '/hack/[event_id]' ],
    // ...other options
}