import React from 'react';
import Router, { browserHistory, Link } from 'react-router';
import axios from 'axios';
import Navbar from './func/navbar';

export default class Eventinfo extends React.Component {
  constructor() {
    super();
    this.state = {
      eventInfo: {},
    };
  }

  componentWillMount() {
    const selectedEventData = JSON.parse(this.props.params.eventInfo);
    axios.get(`http://ec2-52-78-69-252.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`)
    .then((res) => {
      const eventContents = JSON.parse(res.data);
      this.setState({
        eventInfo: eventContents,
      });
    });
  }

  render() {
    const memberList = [];
    const eventEditAuth = JSON.parse(this.props.params.eventInfo).isadmin;
    let newrecipientUsername, newrecipientEmail, editButton;
    const eventContents = this.state.eventInfo;
    if (Object.keys(eventContents).length > 0) {
      // 이벤트 권한에 따라 이벤트 버튼 추가
      if (eventEditAuth === true) {
        editButton =
          <Link to={"eventedit/"+this.props.params.eventInfo}>
            <button
              type="button"
              className="btn btn-outline-primary"
            >
              이벤트 수정
            </button>
          </Link>;
      } else {
        editButton = '';
      }
      newrecipientUsername = eventContents.newrecipient.username;
      newrecipientEmail = eventContents.newrecipient.email;
      eventContents.participants.forEach((member) => {
        memberList.push(
          <tr>
            <td>{member.username}</td>
            <td>{member.email}</td>
          </tr>);
      });
    }

    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="row">
            <div className="col-md-3" />
            <div className="col-md-6">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3>{eventContents.eventname}</h3>
                </div>
                <div className="panel-body">
                  <h4>
                    <p className="eventInfoGroupname">
                      1.groupname : {eventContents.groupname}
                    </p>
                  </h4>
                  <hr />
                  <h4>
                    <p className="eventInfoDate">
                      2.date : {eventContents.date}
                    </p>
                  </h4>
                  <hr />
                  <h4>
                    <p className="eventInfoRecipient">
                      3.정산자 : {newrecipientUsername} ({newrecipientEmail})
                    </p>
                  </h4>
                  <hr />
                  <h4>4.참석자 :</h4>
                  <br />
                  <table className="table table-hover memberSelect">
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>이메일</th>
                      </tr>
                    </thead>
                    {memberList}
                  </table>
                </div>
                <div className="panel-footer">
                  <center>{editButton}</center>
                </div>
              </div>
            </div>
            <div className="col-md-3" />
          </div>
        </div>
      </div>
    );
  }
}
