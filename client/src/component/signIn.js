import React from 'react';
import axios from 'axios';

export default class SignIn extends React.Component {
  constructor() {
    super();
    this.handleSignIn.bind(this);
  }

  handleSignIn() {
    console.log('login Click');
    gapi.client.load('plus', 'v1', () => {
      const request = gapi.client.plus.people.get({
        'userId': 'me'
      });
      request.execute((resp) => {
       console.log('Retrieved profile for:' + resp.displayName, resp);
      });
    });
    // axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/auth/google/')
    // .then((res) => {
    //   console.log("log in succeeded! response looks like:", res);
    //   // ask backend guys to redirect to the landing my page?
    // });
  }

  render() {
    const imgUrl = 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ8_5_tR-TwcWhgMpLeYG7Be1dlXtzaP2VPrnpmEv38IcxxU5nA';


    return (
      <div>
        <a href="http://localhost:3000/auth/google/">
          <img src={imgUrl} className="signIn" onClick={this.handleSignIn} />
        </a>
      </div>
    );
  }
}
