# OHack Development Environment Setup
Opportunity Hack site uses NextJS which makes most things pretty easy.
This page provides a couple of things you will still need to do to
get you development environment up and running.

Developers can set up their environments on their local computers or use
Codespaces. We recomend that develoers use VSCode if they choose to 
develop on their local computers. 

## Fork the OHACK repository.
You will need to fork either the 
[frontend-ohack.dev](https://github.com/opportunity-hack/frontend-ohack.dev) 
reository and/or 
[backend-ohack.dev](https://github.com/opportunity-hack/backend-ohack.dev) 
repository or both. 
- All pull requests (PR) must be done from your fork. 
- All code should be pushed to your private fork. Create a PR by merging from your fork.

<img src="./pics/O-Hack_Fork1.jpg" width="700" height="150">


## IDE Setup
As stated, developers can use either a local (on you local PC) or Codespaces.
There are pros and cons to both. 
| Setup | Pros | Cons |
|:-----:|:----:|:----:|
| Codespaces | All NodeJS is set up.<br>Your VSCode IDE is set up. | Code is remote. <br> You must be online.|
| Local | All your code is local. | You need to set all NodeJS tools.<br>You need to set up your IDE. |

### Codespaces Setup
* In you browser, go to YOUR fork.
* Click on the GREEN code button -> Codespaces tab -> Codespaces "Your workspaces in the cloud" plus link.

<img src="./pics/StartCodespaces1.jpg" width="350" height="150">

* Your Codespaces automatically set up in you browser. You will have a VSCode IDE.

### Local PC Setup
* If you have not done so, install [NodeJS](https://nodejs.org/en/). Follow the instructions from the [NodeJS](https://nodejs.org/en/) page.
* As of 2024, we're using Node v20
* If you have not done so, install [VSCode](https://code.visualstudio.com/).

* Create you local clone on your PC using the following command:
```bash
git clone git@github.com:<your_fork>/frontend-ohack.dev.git
```

## Remaining tasks
* Change directory to your local clone on your PC.
* Create and new file in you clone root directory using your IDE called `.env`.
* Add the following lines to the new `.env` file.
* See this
[OHack doc](https://docs.google.com/document/d/1RDJsTLouF3S35mgFZptQv4DZXK0SC6P1mieCinFicDs/edit#bookmark=id.3ha1trc3tfll) to get the values you should add to this `.env` file.

* Install the application depended node modlules.
```bash
npm install
```
* Start the applcation. Make sure your application is running on port 3000 to support PropelAuth's allowlist.
```bash
npm run dev
```
* To force this to run on port 3000, you can use the following
    * MacOS/Linux: `PORT=3000 npm run dev`
    * Windows: `set PORT=3000 && npm run dev`

You have successfully set up your frontend development environment!

_"May the force be with you!"_