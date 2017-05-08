import React from 'react';

export default class SignIn extends React.Component {

  render() {
    const imgUrl1 = 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ8_5_tR-TwcWhgMpLeYG7Be1dlXtzaP2VPrnpmEv38IcxxU5nA';
    const imgUrl2 = 'https://i.stack.imgur.com/ZW4QC.png';
    return (
      <div>
        <a href="http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/auth/google/">
          <img className="googleButton" src={imgUrl1} />
        </a>
        <a href="http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/auth/facebook/">
          <img className="facebookButton" src={imgUrl2} />
        </a>
      </div>
    );
  }
}
