// imports
const express = require("express")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const dotenv = require("dotenv").config()
const cors = require("cors")
const passport = require("passport")
const session = require("express-session")
const GitHubStrategy = require("passport-github2").Strategy

// constants
const port = 3000

const {
    CLIENT_URL,
    MONGO_USER,
    MONGO_PASS,
    MONGO_HOST,
    MONGO_DBNAME,
    MONGO_DBCOLLECTION_USERS,
    MONGO_DBCOLLECTION_LOGS,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    EXPRESS_SESSION_SECRET
} = process.env

// init express server
const server = express()
server.use(cors())

server.use(session({
    secret: EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
server.use(passport.initialize())
server.use(passport.session())
server.use(express.json())

// ------------------------ DB connection ------------------------ 
let db, users, logs
async function connectDB() {
    try {
        const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}`
        const client = new MongoClient(uri)
        
        // Connect the client to the server (optional starting in v4.7)
        await client.connect()
        console.log("You successfully connected to MongoDB!")
        
        // set for later use
        db = client.db(MONGO_DBNAME)
        users = db.collection(MONGO_DBCOLLECTION_USERS)
        logs = db.collection(MONGO_DBCOLLECTION_LOGS)
    } catch (err) {
        console.error("Error connecting to the database", err)
        process.exit(1)
    }
}

// ------------------------ login, auth, and routing ------------------------ 
passport.serializeUser(function (user, done) {
    done(null, { username: user.username, id: user.id })
})

passport.deserializeUser(function (obj, done) {
    done(null, obj)
})

passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
    },
    async function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile)
        })
    }
))

server.get("/auth/github/callback", 
    passport.authenticate("github", { session: true, failureRedirect: "/login" }),
    function (req, res) {
        res.redirect("/tracker")
    }
)
server.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }))

function ensureAuth(req, res, next) {
    console.log(req.user)
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect("/login")
    }
}

server.get("/tracker", ensureAuth, (req, res) => {
    res.redirect(`${CLIENT_URL}/tracker`)
})

server.get("/login", (req, res) => {
    if (req.user) {
        res.redirect("/tracker")
    } else {
        res.redirect(CLIENT_URL)
    }
})

server.get("/logout", (req, res) => {
    req.logout(() => { })
    res.redirect("/login")
})

// ------------------------ handle GET requests ------------------------ 
server.get("/api/all-data", ensureAuth, async (req, res) => {
    console.log("test")
    res.header("Access-Control-Allow-Origin", 'http://localhost:5173');
    const userdata = await db.find({ username: req.user.username }).toArray()
    res.json(userdata)
})

// ----------------------- handle POST requests ----------------------- 
server.post("/api/submit", ensureAuth, (req, res) => {
    handleSubmit(req, res);
});

server.post("/api/delete", (req, res) => {
    handleDelete(req, res);
});

server.post("/api/edit", (req, res) => {
    handleEdit(req, res);
});

const handleSubmit = function(req, res) {
    // process data being received
    let dataString = ""
    req.on( "data", function( data ) {
        dataString += data
    })
    
    // once we have all the data
    req.on( "end", async function() {
        // process data and add to internal storage
        dataJSON = JSON.parse(dataString)
        const [hours, minutes] = calculateTimePracticed(dataJSON["start"], dataJSON["end"])
        dataJSON["hours"] = hours
        dataJSON["minutes"] = minutes
        dataJSON["username"] = req.user.username

        // get a unique ID number and add to json
        let result = await logs.insertOne(dataJSON)
        dataJSON["_id"] = result.insertedId
        
        // write OK and send back derived data
        res.status(200).json(dataJSON)
    })
}

const handleDelete = function (request, response) {
    let dataString = ""
    request.on( "data", function( data ) {
        dataString += data
    })

    request.on( "end", async function() {
        // find the index of the entry with the matching ID
        const dataJSON = JSON.parse(dataString);
        await logs.deleteOne({_id: new ObjectId(dataJSON._id)})
        
        // write OK
        response.status(200).json(dataJSON);
    });
}

const handleEdit = function (request, response) {
    let dataString = "";
    request.on("data", function (data) {
        dataString += data;
    });
    
    request.on("end", async function () {
        const dataJSON = JSON.parse(dataString);
        
        // find entry w/ matching ID
        let logEntry = await logs.findOne({_id: new ObjectId(dataJSON._id)})
        if (logEntry) {
            // take original logEntry fields and edit them with the new dataJSON fields
            const [hours, minutes] = calculateTimePracticed(dataJSON.start, dataJSON.end);
            dataJSON.hours = hours
            dataJSON.minutes = minutes
            
            // update db
            let editedJSON = { ...logEntry, ...dataJSON }
            editedJSON._id = new ObjectId(editedJSON._id)
            await logs.replaceOne({_id: new ObjectId(dataJSON._id)}, editedJSON)
            
            // write OK
            response.status(200).json(editedJSON);
        } else {
            response.status(404).json({ error: "Entry not found" });
        }
    });
}

function calculateTimePracticed(startStr, endStr) {
    // extract time info
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);
    
    // calc elapsed time
    elapsedMillis = endTime - startTime
    elapsedHours = Math.floor(elapsedMillis / (1000 * 60 * 60))
    elapsedMinutes = Math.floor((elapsedMillis % (1000 * 60 * 60)) / (1000 * 60))
    
    // send back hours:mins practiced
    return [elapsedHours, elapsedMinutes]
}

// ------------------------ start server ------------------------ 
async function startServer() {
    await connectDB() // wait for db connection to establish
    server.listen(process.env.PORT || port, () => {
        console.log(`Server is running on port ${port}`)
    })
}
startServer()
