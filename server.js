const path = require("path")
const express = require("express")
const app = express()
const mongoose = require('mongoose')
const router = require('./src/backend/controls/routes.js')

const bodyParser = require('body-parser')
const expressSession = require('express-session')
const passport = require('passport')



const url = "mongodb://user1:password1@ds143071.mlab.com:43071/redditclone"  
mongoose.connect(url)


app.use(bodyParser())
app.use(expressSession({secret: 'aSecretKey'}))
app.use(passport.initialize())
app.use(passport.session())


app.use('/api', router)

app.use('/', express.static(path.join(__dirname, '/src/frontend/assets')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/frontend/assets/index.html'))
})

app.get('/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/frontend/assets/app.js'))
})



app.listen(process.env.PORT || 5000)