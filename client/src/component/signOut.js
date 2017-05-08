import React from 'react';

export default class SignOut extends React.Component {
  render() {
    // const imgUrl = 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ8_5_tR-TwcWhgMpLeYG7Be1dlXtzaP2VPrnpmEv38IcxxU5nA';

    return (
      <div>
        <a className="logout" href="http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.comlogout">
          Logout
        </a>
      </div>
    );
  }
}
