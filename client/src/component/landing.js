import React from 'react';
import { Link } from 'react-router';
import SignIn from './signIn';

export default class Landing extends React.Component {



  render() {
    // console.log('this.state?', this.state)
    // console.log('rewrqxw')

    return (
    <div>
      <div className="landing">
        Show your account!
        <br/>
        <br/>
        <SignIn />
      </div>
    </div>
    );
  }
}
