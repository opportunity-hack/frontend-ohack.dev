# Opportunity Hack Developer Portal (Frontend)
- This code is the frontend [ohack.dev](https://www.ohack.dev) and makes calls to the backend [api.ohack.dev](https://api.ohack.dev) along with some calls to Auth0
- Like most things we build, to keep it simple, this runs on [Heroku](https://trifinlabs.com/what-is-heroku/).
- Grab [VSCode](https://code.visualstudio.com/) as your IDE, we'll use this for both frontend and backend.
- [ohack.dev backend code is here](https://github.com/opportunity-hack/backend-ohack.dev)


This code sample demonstrates how to implement authentication in a React Single-Page Application (SPA) and was copied as a boilerplate from [Auth0 here](https://github.com/auth0-developer-hub/spa_react_javascript_hello-world)

First things first, you will need to get the code for this project via:
```
git clone git@github.com:opportunity-hack/backend-ohack.dev.git
```
Jump into that directory to get going with the steps below!

## Get Started
First things first, you will need to get the code for this project via:
```
git clone git@github.com:opportunity-hack/frontend-ohack.dev.git
```
Jump into that directory to get going with the steps below!


Install the project dependencies:

```bash
npm install
```

Copy the `env_template` file to a `.env` file under the root project directory and update the `<TODO>` portions with your values.

Run the application:
```bash
npm start
```
Visit [`http://localhost:4040/`](http://localhost:4040/) to access the application.

# References
## React UI Tools
We're using MUI as much as possible, [check out their website](https://mui.com/) for more information.


## Heroku Custom Domains
It's not obvious here, but we had to upgrade our account to Hobbyist in order to get the SSL cert capability, without this, we could not make a HTTPS call nor serve HTTPS traffic on our custom domain
https://devcenter.heroku.com/articles/custom-domains

We have 3 CNAMES:
- www.ohack.dev: we want everyone to land here
- api.ohack.dev: for any API calls to 
- frontend.ohack.dev: the same thing as www.ohack.com, but more for completeness

## Tips and Tricks
### CSS Color gradient tool
We have a couple of these, and it was super easy to make with [this tool](https://www.w3schools.com/colors/colors_gradient.asp).

### Google's Font/Icon Collection
As learned from the Udemy course, [this is a pretty easy way](https://fonts.google.com/icons?icon.style=Outlined&icon.query=heart) to get fonts and icons.  Right click on the SVG button to copy the link for any icon.