const mongoose = require('mongoose')
const isValidObjectId = mongoose.Types.ObjectId.isValid

const Post = require('./Post.js')
const Comment = require('./Comment.js')
const User = require('./User.js')

const isCommentOrPost = require('../../../helper-functions/isCommentOrPost.js')
const areAllCommentsOrPosts = require('../../../helper-functions/areAllCommentsOrPosts.js')
const getObjVals = require('../../../helper-functions/getObjVals.js')
const convertArrToObj = require('../../../helper-functions/convertArrToObj.js')






var mongooseStrategies = new Object()


mongooseStrategies.insert = function (modelName, inputObj, callback) {
    /**
        Inserts one or multiple comment or post objects into the db. If multiple objects are passed, insert() expects them to be contained in an object wrapper

            Input:
                a) modelName (string)
                b) inputObj (an Object instance): 
                c) callback: executed only after a comment or post object has been inserted into the db, and it is only passed an error object
                
            Error Handling:
                -Throws an exception when not passed either 'post' or 'comment' for modelName
                -Throws an exception when inputObj is not a post or comment, or not passed an object wrapper containing post or comment objects
    **/
    

    if (modelName !== 'post' && modelName !== 'comment') {
        throw new TypeError("Need to pass either 'comment' or 'post' for modelName parameter")
    }  
    
    if (modelName === 'post') {
        //Insert inputObj into the db if it is a post
        if (isCommentOrPost('post', inputObj)) {
            const post = new Post(inputObj)
            post.save((err) => callback(err))
        }
        //If inputObj's values are all posts, then insert all values into the db
        else if (areAllCommentsOrPosts('post', inputObj)) {
            const values = getObjVals(inputObj)
            for (var i=0; i < values.length; i++) {
                var val = values[i]
                const post = new Post(val)
                post.save()
            }
        }
        else {
            throw new TypeError('Need to pass correct object type for inputObj parameter')  
        }
    }
    
    else if (modelName === 'comment') {
        //Insert inputObj into the db if it is a comment
        if (isCommentOrPost('comment', inputObj)) {
            const comment = new Comment(inputObj)
            comment.save(err => callback(err))
        }
        //If inputObj's values are all comments, then insert all values into the db
        else if (areAllCommentsOrPosts('comment', inputObj)) {
            const values = getObjVals(inputObj)
            for (var i=0; i < values.length; i++){
                var val = values[i]
                const comment = new Comment(val)
                comment.save()
            }
        }
        else {
            throw new TypeError('Need to pass correct object type for inputObj parameter')  
        }
    } 
}


mongooseStrategies.getAllPosts = function (callback) {
    Post.find({}, '-__v -_id', {lean: true}, (err, result) => {
        if (err) return callback(err)
        if (result.length === 0) throw new Error('No posts found')
        if (result.length === 1) return callback(null, result[0])
        
        const posts = convertArrToObj(result)
        callback(null, posts)
    })    
}


mongooseStrategies.getCommentsByPost = function (objectId, callback) {
    Comment.find({parent: objectId}, '-_id -__v', {lean: true}, (err, result) => {
        if (err)                   return callback(err) 
        if (result.length === 0)   return callback(new Error('No comments found'))
        if (result.length === 1)   return callback(null, result[0])
        
        const comments = convertArrToObj(result)
        callback(null, comments)
    })   
}


mongooseStrategies.createUser = function (credentials, callback) {
    const username = {username: credentials.username}
    User.findOne(username, (err, result) => {
        if (err) return callback(err) 
        if (result) return callback(null, undefined)
        
        const user = new User(credentials)
        user.save((err) => {
            if (err) return callback(err)
            return callback(null, user)
        })
    })   
}



module.exports = mongooseStrategies