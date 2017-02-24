import React from 'react';

export default class SignIn extends React.Component {

  render() {
    const imgUrl1 = 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ8_5_tR-TwcWhgMpLeYG7Be1dlXtzaP2VPrnpmEv38IcxxU5nA';
    const imgUrl2 = 'http://www.freeiconspng.com/uploads/facebook-sign-in-button-png-26.png';
    return (
      <div>
        <a href="http://localhost:3000/auth/google/">
          <img src={imgUrl1} className="signIn" />
        </a>
        <a href="http://localhost:3000/auth/facebook/">
          <img src={imgUrl2} className="signIn" />
        </a>
      </div>
    );
  }
}
