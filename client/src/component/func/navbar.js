import React from 'react';
import { Link, browserHistory } from 'react-router';
import axios from 'axios';
import SignOut from '../signOut';
import History from '../history';
import NewEvent from '../newEvent';


export default class Navbar extends React.Component {

  render() {
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container">
            <div className="row">
              <div className= "col-md-4">
                <div className="navbar-header">
                  <div className="navbar-brand" ><Link to="mypage"><b className="navbarMenu">n분의 일</b></Link></div>
                </div>
              </div>
              <div className= "col-md-8">
                <ul className="nav navbar-nav navbar-right">
                  <li className="dropdown">
                    <a className="dropdown-toggle navbarMenu" data-toggle="dropdown" href="#"><b className="navbarMenu">내 이벤트
                    </b><span className="caret"></span></a>
                    <ul className="dropdown-menu">
                      <li className="newevent" ><Link to={"transaction"}><b>이벤트 생성</b></Link></li>
                      <li className="eventHistory" ><Link to={"history"}><b>정산내역</b></Link></li>
                    </ul>
                  </li>
                  <li>
                  <Link to={"grouppage"}>
                    <a className="dropdown-toggle navbarMenu" data-toggle="dropdown" href="#"><b className="navbarMenu">내 그룹
                    </b></a>
                  </Link>
                  </li>
                  <li className="navbarMenu"><a className="logout" href="http://ec2-52-78-69-252.ap-northeast-2.compute.amazonaws.com:3000logout"><b className="navbarMenu">로그아웃</b></a></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
