## **Vivek Voleti: CS 4241 Assignment A4:** Instrumental Practice Tracker With GitHub OAuth 

Link: http://localhost:5173

Note: I got an extension from Prof. Wong until 2/19 to accommodate being sick.

### About
This is a practice log tracker for a musician to track their practice sessions via a `Form`. For each log, the `Server` keeps track of the start/end time of practice session, what was practiced, and some details about the practice session. I took my A3 submission, implemented the front end in `React`, and added GitHub OAuth to create this verison with the contains the A4 requirements.

### Note on deployment
With this project, I faced an incredible amount of problems deploying the application. The entire workflow including GitHub authentication works perfectly locally, but after attempting to deploy to various domains (I tried Glitch, Vercel, and Render), I kept running into the same problem where API requests made after authentication (which happens successfully) never pass the authentication check again. The best workaround that course staff could find was to use a proxy for my `/api/*` routes in `./client/vite.config.js`, but this is a workaround that does not work in deployment.

I debugged this issue with multiple course staff for several hours over slack/zoom to no avail. In particular, I spent the entire duration of Milo's office hours debugging, but he wasn't able to quite figure out what was happening either. I had a very extensive debugging process that I haven't detailed here, but I don't have the time to spend the rest of today debugging this issue. As a result, I have added my `.env` file to this repo and provded directions below on how to run this locally.

Since my entire app should work locally, I humbly ask for any partial credit you can give on deployment points, given that course staff was not able to help me deploy succesfully either.

## Directions to run locally
 - Clone this repository
 - Open up two shells, and `cd` into `./server` in one shell **("shell 1")** and `./client` in the other **("shell 2")**
 - In **shell 1**: run `npm install` followed by `node server.js`
 - In **shell 2**: run `npm install` followed by `npm run dev`
 - Open http://localhost:5173 in your browser

**Two important notes:** <br>
 (1) I'm using node version 22. If you're using node version 16 and run into problems, try updating to the latest LTS version, removing the `node_modules` directories, and rerunning `npm install` in both `./client` and `./server`.<br>
 (2) Shell 2 should start the react server on `http://localhost:5173`, not any other port. If you already have a react dev server running on port `5173`, you'll need to end it and run my project so it ends up on port `5173`. If for some reason you absolutely cannot do that, feel free to change the `CLIENT_URL` in `./server/.env` accordingly.

## Instructions/workflow
### Login
 - Click the button and authorize through GitHub

### Submit a log
 - Fill out the form as you want to - this should be straightforward
 - There can be any number of checkboxes selected
 - Once you submit an entry, it'll appear in "All logs"

### Deleting/modifying a log
 - For your entries in "All logs", you can either <b>(1)</b> delete the entry, or <b>(2)</b> modify it
 - If you choose to edit that row, the client will **repopulate the form fields** with the saved data
 - Edit the fields as desired, click **Update**, and the table should have successfully updated the row.

### Logout
 - Press the logout button below the table to log out