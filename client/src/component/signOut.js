import React from 'react';
import GoogleLogin from 'react-google-login'

export default class SignOut extends React.Component {

  handleSignOut(){


    // console.log('Hi!')
    // const auth2 = gapi.auth2.getAuthInstance();
    // console.log(auth2);
    // auth2.signOut().then(() => {
    //   console.log('User signed out.');
    // });

    // gapi.client.load('plus', 'v1', () => {
    //   const request = gapi.client.plus.people.get({
    //     'userId': 'me'
    //   });
    //   request.execute((resp) => {
    //    console.log('Retrieved profile for:' + resp.displayName, resp);
    //   });
    // });
  }

  render() {
    const imgUrl = 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ8_5_tR-TwcWhgMpLeYG7Be1dlXtzaP2VPrnpmEv38IcxxU5nA';

    return (
      <div>
        <a className="logout" href="http://localhost:3000/logout">
          Logout
        </a>
      </div>
    )
  }
}
