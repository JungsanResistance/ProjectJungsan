import React from 'react';
import SignIn from './signIn';

export default class Landing extends React.Component {
  render() {
    return (
      <div>

        <div className="container-fluid">
          <div className="col-sm-2"></div>
          <div className="col-sm-8">
          <div className="jumbotron">
            <header>
              <h1 className="mainPageHeader">
              n분의 일
              </h1>
              <br />
              <br />
              <p className="mainPageParagraph">This page will grow as we add more and more components from Bootstr...</p>
              <ul>

              </ul>
            </header>
          </div>
          <br/>
          <center><SignIn /></center>
          </div>
        <div className="col-sm-2"></div>

        </div>
      </div>
    );
  }
}
