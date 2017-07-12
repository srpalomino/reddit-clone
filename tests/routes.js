const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../src/models/User.js')
const expressSession = require('express-session')

const mongoose = require('mongoose')
const url = "mongodb://user1:password1@ds155091.mlab.com:55091/redditmock"  
mongoose.connect(url)





passport.use(new LocalStrategy(
    (username, password, done) => {
        User.findOne({username: username}, (err, user) => {
            if (err) return done(err)
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (user.password !== password) {
                return done(null, false, { message: 'Incorrect password.' })
            }
            return done(null, user)
        })
    }
))


passport.serializeUser((user, done) => {
    console.log('serialize executes')
    done(null, user._id)
})
passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user) {
    done(err, user)
  })
})



app.use(bodyParser())
app.use(expressSession({secret: 'aSecretKey'}))
app.use(passport.initialize())
app.use(passport.session())

app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('Login route hit')
  res.send('sup bro')
})

const server = app.listen(3000)


describe('Routes', () => {
    it('Responses from /login contain a cookie', (done) => {
        request(server)
            .post('/login')
            .type('form')
            .send({username: 'srpalo'})
            .send({password: 'secretpassword'})
            .expect(200)
            .then((res) => {
                const cookie = res.header['set-cookie'][0]
                if (!cookie) {
                    throw new Error('Authentication Failed: response did not contain a cookie')
                }
                done()
            })

    })
})
