# Are you here for Opportunity Hack 2022?

- Hacker Signup [on DevPost](https://opportunity-hack-2022.devpost.com/)
- Arizona [In-person RSVP form](https://docs.google.com/forms/d/e/1FAIpQLScTveAW1rOEN_YO-IgI0qmi3aPkFH71O5j1OElqgYUXScKysA/viewform)
- Mentor [signup](https://docs.google.com/forms/d/e/1FAIpQLSdY352vtbNhNM5fyKozQ7HbuxCKfkU6xTO2aA7cKx7UpWRZog/viewform) and more about OHack [mentorship](https://www.ohack.org/about/mentors)
- Follow us on [Instagram](https://www.instagram.com/opportunityhack/), [LinkedIn](https://www.linkedin.com/company/opportunity-hack/), [YouTube](https://www.youtube.com/@opportunityhack)


# Opportunity Hack Developer Portal (Frontend)
- 📝 [ohack.dev backend code is here](https://github.com/opportunity-hack/backend-ohack.dev)
- This code is the frontend [ohack.dev](https://www.ohack.dev) and makes calls to the backend [api.ohack.dev](https://api.ohack.dev) along with some calls to Auth0
- Like most things we build, to keep it simple, this runs on [Heroku](https://trifinlabs.com/what-is-heroku/).
- We borrowed the code from [Auth0 here](https://github.com/auth0-developer-hub/spa_react_javascript_hello-world) to bootstrap our development (always a good practice)


## Quickstart
See the 
[Development Setup instructions](./docs/DevSetup.md) 
to get up and running quickly.

# References
## React UI Tools
We're using Material UI (MUI) as much as possible, [check out their website](https://mui.com/) for more information.


## Heroku Custom Domains
It's not obvious here, but we had to upgrade our account to Hobbyist in order to get the SSL cert capability, without this, we could not make a HTTPS call nor serve HTTPS traffic on our custom domain https://devcenter.heroku.com/articles/custom-domains

We have 3 CNAMES:
- www.ohack.dev: we want everyone to land here
- api.ohack.dev: for any API calls to 
- frontend.ohack.dev: the same thing as www.ohack.com, but more for completeness

## Tips and Tricks
### CSS Color gradient tool
We have a couple of these, and it was super easy to make with [this tool](https://www.w3schools.com/colors/colors_gradient.asp).

### Google's Font/Icon Collection
As learned from the Udemy course, [this is a pretty easy way](https://fonts.google.com/icons?icon.style=Outlined&icon.query=heart) to get fonts and icons.  Right click on the SVG button to copy the link for any icon.

## IDE
If you don't want to use GitHub Codespaces, we perfer to use VSCode to do our development. Grab [VSCode](https://code.visualstudio.com/) as your IDE, we'll use this for both frontend and backend.

## git Comand Line Interface (CLI) cheet sheets
Here are a couple git CLI references.
* From [GitHub](https://education.github.com/git-cheat-sheet-education.pdf)
* From [Atlassian](https://www.atlassian.com/git/tutorials/atlassian-git-cheatsheet)
