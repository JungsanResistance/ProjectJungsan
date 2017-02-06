import React from 'react';
import axios from 'axios';

export default class SignIn extends React.Component {
  handleSignIn () {
    axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/auth/google/')
    .then( res => {
      console.log("log in succeeded! response looks like:", res);
      // ask backend guys to redirect to the landing my page?
    })
  }
  render() {
    return (
      <div>
        <img src='http://commondatastorage.googleapis.com/io-2013/presentations/808/images/sign-in-button.png' onClick={this.handleSignIn} />
      </div>
    )
  }
}
