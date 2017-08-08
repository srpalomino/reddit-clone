import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import renderIf from 'render-if'
import reddit from './redditImg.png'
    
const Post = require('./Post.js')
const Comment = require('./Comment.js')
const Login = require('./Login.js')
const Signup = require('./Signup.js')

const findObjByKeyValPair = require('../../helper-functions/findObjByKeyValPair.js')
const getObjVals = require('../../helper-functions/getObjVals.js')
const request = require('superagent')


    
    
    

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {homePageRendered: true, 
                      postPageRendered: false,
                      signupRendered: false,
                      loginRendered: true,
                      postObjects: "", 
                      targetPost: "", 
                      postList: [], 
                      commentList: [], 
                      commentContainerRendered: false, 
                      commentHeader: 'No Comments',
                      activeUser: ""
        }
    }
    
    componentDidMount() {
        //Enables navigating back to home page from post page
        window.onpopstate = function () {
            this.setState({homePageRendered: true, postPageRendered: false})
        }.bind(this)
        
        const preparePostList = function(err, res) {
            const posts = getObjVals(res.body)
            const postList = posts.map(post => {
                return <Post 
                    title={post.title} 
                    author={post.author} 
                    id={post.id} 
                    titleHighlighted={true} 
                    onClick={this.clickPostHandler.bind(this)} 
                />
            })
            this.setState({postList: postList, postObjects: res.body})
        }
        
        request
            .get("http://localhost:5000/api/getAllPosts")
            .end(preparePostList.bind(this))
    }
    
    clickPostHandler(e) {
        //Navigate to post page and render the post just clicked on
        const targetPostID = e.target.attributes.getNamedItem('id').value
        const targetPost = findObjByKeyValPair(this.state.postObjects, ['id', targetPostID])
        this.setState({targetPost: targetPost, homePageRendered: false, postPageRendered: true})
        
        //Load all the comments associated with the post just clicked on
        fetch("http://localhost:5000/api/getCommentsByPost/" + targetPostID)
            .then(res => {
                if (res.status === 200) return res.json()
            })
            .then(comments => {
                const commentList = getObjVals(comments).map(comment => {
                    return <Comment  
                        author={comment.author} 
                        body={comment.comment} 
                    />
                })
                this.setState({commentList: commentList, commentHeader: 'Comments', commentContainerRendered: true})
            })
    }
    
    loginRequestHandler(credentials) {     
        const callback = function (err, res) {
            if (err) {
                if (err.message === 'Bad Request') return alert('Incorrect username or password')
                return alert('Sorry, an error occured with the server')
            } 
            const username = credentials.username
            if (res.status == 200) this.setState({loginRendered: false, activeUser: username})
        }
        
        request
            .post("http://localhost:5000/api/login")
            .send('username=' + credentials.username)
            .send('password=' + credentials.password)
            .end(callback.bind(this))
    }
    
    signupRequestHandler (credentials) {
        const username = credentials.username
        const password = credentials.password
        const verifyPassword = credentials.verifyPassword
        
        if (password !== verifyPassword) {
            return alert('Passwords do not match')
        }
        
        
        const callback = function (err, res) {
            if (err) {
                if (err.message === 'Bad Request') return alert('Username is already in use')
                return alert('Sorry, an error occured with the server')
             } 
            if (res.status == 200) this.setState({signupRendered: false, activeUser: username})
        }
        
        request
            .post("http://localhost:5000/api/signup")
            .send('username=' + username)
            .send('password=' + password)
            .end(callback.bind(this))
    }
    
    
    render() {
        const bannerStyling = {
            backgroundColor: '#cee3f8',
            border: 'solid #30b5b5',
            height: '15px',
            position: 'absolute',
            padding: '20px',
            borderWidth: 'thin',
            
            top: '0',
            right: '0',
            left: '0'
        }
        
        const redditImgStyling = {
            position: 'absolute',
            top: '5px',
            left: '160px'
        }
        
        const signupMsgContainerStyling = {
            position: 'absolute',
            right: '0px',
            bottom: '0px',
            backgroundColor: '#EFF7FF',
            padding: '4px',
            lineHeight: '12px',
            borderTopLeftRadius: '7px',
            color: '#808080',
            font: 'small verdana',
        }
        
        const signupLinkStyling = {
            font: 'small verdana',
            textDecoration: 'none'
        }
        
        const wrapperStyling = {
            marginLeft: '150px',
            marginTop: '100px'
        }
        
        const commentHeader = {
            fontSize: '15px',
            fontWeight: '200',
            color: '#4D5763',
            marginTop: '8%'
        }
        
        const commentContainerStyling = {
            marginLeft: '1%',
            marginRight: '18%',
            paddingLeft: '1%',            
            borderColor: '#e6eeff',
            borderStyle: 'solid',
            borderRadius: '5'
        }
        
        return (
            <div className="App" style={bannerStyling}>
                {renderIf(this.state.loginRendered) (
                    <div>
                        <span style={signupMsgContainerStyling}> 
                            Want to join?&nbsp;
                            <a href="#" style={signupLinkStyling} onClick={() => this.setState({signupRendered: true, loginRendered: false})}> 
                                Signup 
                            </a>
                            &nbsp;in seconds
                        </span>
                        <Login onSubmit={this.loginRequestHandler.bind(this)}/>
                    </div>
                )}
                
                {renderIf(this.state.signupRendered) (
                    <Signup onSignupRequest={this.signupRequestHandler.bind(this)} />
                )}
                
                <img src={require('./redditImg.png')} style={redditImgStyling} />
                
                {renderIf(this.state.homePageRendered) (
                    <div className="postWrapper" style={wrapperStyling}>       
                        {this.state.postList}
                    </div>  
                )}
                
                {renderIf(this.state.postPageRendered) (
                    <div className="postPage" style={wrapperStyling}> 
                        <Post title={this.state.targetPost.title} author={this.state.targetPost.author} />
                        <p style={commentHeader}> {this.state.commentHeader} </p>   
                        {renderIf(this.state.commentContainerRendered) (
                            <div style={commentContainerStyling}>
                                {this.state.commentList}
                            </div>                        
                        )}
                    </div>
                )}                
            </div>
        )
    }
}




function run() {
    ReactDOM.render(<App/>, document.getElementById('root'));
}

if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', run);
} 
else {
    window.attachEvent('onload', run);
}
