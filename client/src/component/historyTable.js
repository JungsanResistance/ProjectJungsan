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
    let actionButton = '';
    let declineButton = '';
    let history, tableName, tableType;

    console.log("debtHistory",this.props.debtHistory)
    console.log("loanedHistory",this.props.loanedHistory)

    if(this.props.debtHistory) {
      history = this.props.debtHistory;
    }
    else {
      history = this.props.loanedHistory;
    }

//debt와 loaned 구분//

  if (history) {
    history.forEach((eventItem, index) => {
      if (eventItem.email !== this.props.myEmail) {
        //이벤트 수정권한 추가//
        if (eventItem.isadmin) {
          editButton = <input type="button" value="eventEdit" />;
        }
        else {
          editButton = '';
        }

        if(history === this.props.debtHistory) {
          tableName = '줘야함';
          if(eventItem.status === null || eventItem.status === 3) {
            actionButton = '정산요청';
          }
          else if (eventItem.status === 1) {
            actionButton = '정산중';
          }
          else {
            actionButton = '정산완료';
          }
        }
        else {
          tableName = '받아야함';
          if(eventItem.status === null || eventItem.status === 3) {
            actionButton = '정산하기';
            declineButton = '';
          }
          else if (eventItem.status === 1) {
            actionButton = '수락';
            declineButton = <button value='거절' onClick={(event) => this.handleDone(event, index)}>거절</button>;
          }
          else {
            actionButton = '정산완료';
          }
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
            <button value={actionButton} onClick={(event) => this.handleDone(event, index)}>{actionButton}</button>
            {declineButton}
          </td>
        </tr>);
      }
    })
  }

    //
    // if (this.props.debtHistory) {
    //
    //   this.props.debtHistory.forEach((eventItem, index) => {
    //
    //     //to hide me as a recipient in the history
    //
    //   })
    // }
    // else {
    //   tableName = '받아야함';
    //
    //   this.props.loanedHistory.forEach()
    // }



  //   if (history) {
  //     history.forEach((eventItem, index) => {
  //     if (eventItem.email !== this.props.myEmail) { // to hide me as a recipient in the history
  //       let editButton;
  //       let paidCheck = '';
  //       if (eventItem.isadmin) {
  //         editButton = <input type="button" value="eventEdit" />;
  //       }
  //       else {
  //         editButton = '';
  //       }
  //
  //       let actionButton = '요청';
  //       let declineButton = '';
  //
  //       if (eventItem.ispaid) {
  //           paidCheck = <button value="정산완료" onClick={(event) => this.handleDone(event,index)}>"정산완료"</button>;
  //         }
  //       else {
  //         paidCheck = <button value={actionButton} onClick={(event) => this.handleDone(event,index)}>{actionButton}</button>;
  //       }

  //     }
  //   })
  // };



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
