import React from 'react';
import SignIn from './signIn';

export default class Landing extends React.Component {
  render() {
    return (
      <div>
        <div className="landing">
          Show your account!
          <br />
          <br />
          <SignIn />
        </div>
      </div>
    );
  }
}
