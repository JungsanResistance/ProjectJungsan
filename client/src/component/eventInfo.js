import React from 'react';
import Router, { browserHistory, Link } from 'react-router';
import axios from 'axios';


export default class Eventinfo extends React.Component {
  constructor() {
    super();
    this.state = {
      eventInfo: {},
    };
  }

  componentWillMount() {
    const selectedEventData = JSON.parse(this.props.params.eventInfo);
    axios.get(`http://oneovern.com/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`)
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
      //이벤트 권한에 따라 이벤트 버튼 추가//
      if (eventEditAuth === true) {
        editButton =
        <Link to={"eventedit/"+this.props.params.eventInfo}>
          <input type="button" value='이벤트 수정' />
        </Link>
      } else {
        editButton = '';
      }
      newrecipientUsername = eventContents.newrecipient.username;
      newrecipientEmail = eventContents.newrecipient.email;
      eventContents.participants.forEach((member) => {
        memberList.push(<li>{member.username} ({member.email})</li>);
      });
    }

    return(
      <div>
        <h1>
          {eventContents.eventname}
        </h1>
        <br />
        groupname : {eventContents.groupname}
        <br />
        <br />
        date : {eventContents.date}
        <br />
        <br />
        정산자 : {newrecipientUsername} ({newrecipientEmail})
        <br />
        <br />
        참여자 :
        <ul>
          {memberList}
        </ul>
        <br />
        {editButton}
      </div>
    );
  }
}
