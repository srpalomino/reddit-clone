import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import renderIf from 'render-if'
import reddit from './redditImg.png'
const Post = require('./Post.js')


    
    
    

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {homePageRendered: true, postPageRendered: false}
    }
    
    componentDidMount() {
        //Enables navigating back to home page from post page
        window.onpopstate = function () {
            this.setState({homePageRendered: true, postPageRendered: false})
        }.bind(this)      
    }
    
    clickHandler(e) {
        this.setState({postPageRendered: true, homePageRendered: false})
        console.log(e.target.attributes.getNamedItem('id').value)
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
        
        const wrapperStyling = {
            marginLeft: '150px',
            marginTop: '100px'
        }
        
        return (
            <div className="App" style={bannerStyling}>
                <img src={require('./redditImg.png')} style={redditImgStyling} />
                {renderIf(this.state.homePageRendered) (
                    <div className="postWrapper" style={wrapperStyling}>       
                        <Post title="Title" author="SalPal" onClick={this.clickHandler.bind(this)} ref="1"/>
                    </div>  
                )}
            
                {renderIf(this.state.postPageRendered) (
                    <div className="postPage" style={wrapperStyling}> 
                        {[this.refs['1']]}
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
