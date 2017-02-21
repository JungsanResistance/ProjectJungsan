import React from 'react';
import SignIn from './signIn';

export default class Landing extends React.Component {
  render() {
    return (
      <div>

        <div className="container">
          <div className="jumbotron">
            <h1>일통령의 정산나라!</h1>
            <br />
            <br />
            <p>This page will grow as we add more and more components from Bootstrap...</p>
          </div>
            <br />
          <center><SignIn /></center>
        </div>
      </div>
    );
  }
}
