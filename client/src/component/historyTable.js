import React from 'react';
import Router, { browserHistory, Link } from 'react-router';
import axios from 'axios';

export default class HistoryTable extends React.Component {
  constructor() {
    super();
    this.state = {
      tableName: '',
      debtHistory: [],
      loanedHistory: [],
    }

    this.handleDone = this.handleDone.bind(this);
  }

  // handling event transaction finished
  handleDone(event,index) {

    let historyType, type;

    if (this.props.debtHistory){
      historyType = this.props.debtHistory;
      type = 'debt';
    } else {
      historyType = this.props.loanedHistory
      type = 'loan';
    }

    const nextHistory = [...historyType];
    nextHistory[index].ispaid = !nextHistory[index].ispaid;
    console.log(historyType)
    const historyData = {
      date : nextHistory[index].date,
      recipientemail: nextHistory[index].email,
      eventname: nextHistory[index].eventname,
      groupname: nextHistory[index].groupname,
      ispaid: nextHistory[index].ispaid,
    };



    axios.put(`http://localhost:3000/api/history?type=${type}`, historyData)
    .then(res => {
      console.log(res)
      if(res.status === 200) {
        if(this.props.debtHistory){
          this.setState({
            debtHistory: nextHistory,
          })
        }
        else {
          this.setState({
            loanedHistory: nextHistory,
          })
        }
      }
    })
  }

  render() {
    const eventList = [];
    let editButton = '';
    let history, tableName, tableType;

    if (this.props.debtHistory) {
      history = this.props.debtHistory;
      tableName = '줘야함';
    }
    else {
      history = this.props.loanedHistory;
      tableName = '받아야함';
    }

    if (history) {
      history.forEach((eventItem, index) => {
      if (eventItem.email !== this.props.myEmail) { // to hide me as a recipient in the history
        let editButton;
        let paidCheck = '';
        if (eventItem.isadmin) {
          editButton = <input type="button" value="eventEdit" />;
        }
        else {
          editButton = '';
        }

        let actionButton = '요청';
        let declineButton = '';

        if (eventItem.ispaid) {
            paidCheck = <button value="정산완료" onClick={(event) => this.handleDone(event,index)}>"정산완료"</button>;
          }
        else {
          paidCheck = <button value={actionButton} onClick={(event) => this.handleDone(event,index)}>{actionButton}</button>;
        }
        eventList.push(
        <tr>
          <td>{eventItem.groupname}</td>
          <td>{eventItem.eventname}</td>
          <td>{eventItem.date}</td>
          <td>{eventItem.username} ({eventItem.email})</td>
          <td>{Math.abs(eventItem.cost)}</td>
          <td><Link to={"history/"+JSON.stringify({
              groupname : eventItem.groupname,
              eventname : eventItem.eventname,
              date : eventItem.date,
            })}>
            {editButton}</Link>
          </td>
          <td >
            {paidCheck}
          </td>
        </tr>);
      }
    })
  };
    return (
      <div>
        <h1>
          {tableName}
        </h1>
        <br />
        <tr>
          <th>groupname</th>
          <th>eventname</th>
          <th>date</th>
          <th>name(email)</th>
          <th>cost</th>
          <th>edit</th>
          <th>status</th>
        </tr>
        {eventList}
      </div>
    );
  }
}
