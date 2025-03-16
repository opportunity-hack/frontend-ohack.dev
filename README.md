This is the front-end for [ohack.dev](https://ohack.dev) which is tied to our `main` branch, the `develop` branch auto-deploys to [test.ohack.dev](https://test.ohack.dev).

Opportunity Hack is a 501c3 nonprofit and is a public good.  We encourage you to fork and help us write code for social good!

Follow us on [Instagram](https://www.instagram.com/opportunityhack/), [LinkedIn](https://www.linkedin.com/company/opportunity-hack/), [YouTube](https://www.youtube.com/@opportunityhack).

For OHack'22, ReactLovers greatly improved our UX by working on [#13 update our UX](https://github.com/opportunity-hack/frontend-ohack.dev/issues/13). Running the code can be done similarly as outlined in [Quickstart](#quickstart).


# Opportunity Hack Developer Portal (Frontend)
- 📝 [ohack.dev backend code is here](https://github.com/opportunity-hack/backend-ohack.dev)
- This code is the frontend [ohack.dev](https://www.ohack.dev) and makes calls to the backend [api.ohack.dev](https://api.ohack.dev)
- Like most things we build, to keep it simple, this runs on [Vercel](https://vercel.com/).
- We borrowed the code from [Auth0 here](https://github.com/auth0-developer-hub/spa_react_javascript_hello-world) to bootstrap our development (always a good practice) we've migrated over to use [PropelAuth](https://www.propelauth.com/) to keep our costs down.


## Quickstart
See the 
[Development Setup instructions](./docs/DevSetup.md) 
to get up and running quickly.

## Testing

### Unit Tests

Run unit tests with Jest:

```bash
npm run test
```

### End-to-End Tests

Run end-to-end tests with Playwright:

```bash
# Install Playwright dependencies (first time only)
npx playwright install --with-deps chromium

# Run E2E tests
npm run test:e2e
```

View the Playwright test report:

```bash
npx playwright show-report
```

# References
## React UI Tools
We're using Material UI (MUI) as much as possible, [check out their website](https://mui.com/) for more information.

## DNS
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