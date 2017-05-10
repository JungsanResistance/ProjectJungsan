import React from 'react';
import SignIn from './signIn';

export default class Landing extends React.Component {
  render() {
    return (
      <div>
        <div className="container-fluid">
          <div className="col-sm-2" />
          <div className="col-sm-8">
            <div className="jumbotron landingPageJumbotron">
              <header>
                <h1 className="mainPageHeader">
                  n분의 일
                </h1>
                <br />
                <br />
                <p className="mainPageParagraph">
                  N빵 하기 어려우시죠. 1/n 이 쉽게 해결해 드리겠습니다
                </p>
                <p>
                  <center>
                    <img
                      className="img-responsive"
                      src="http://image.chosun.com/sitedata/image/201606/10/2016061000149_0.jpg"
                    />
                  </center>
                </p>
              </header>
            </div>
            <br />
            <center>
              <SignIn />
            </center>
          </div>
          <div className="col-sm-2" />
        </div>
      </div>
    );
  }
}
