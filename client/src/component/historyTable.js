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

    if(this.props.debtHistory){
      historyType = this.props.debtHistory;
      type = 'debt';
    } else {
      historyType = this.props.loanedHistory
      type = 'loan';
    }
    console.log("historyTypehistoryType:::",historyType)
    console.log(index)
    const nextHistory = [...historyType];
    console.log("Historydata::",nextHistory[index])
    nextHistory[index].ispaid = !nextHistory[index].ispaid;
    const historyData = {
      date : nextHistory[index].date,
      recipientemail: nextHistory[index].email,
      eventname: nextHistory[index].eventname,
      groupname: nextHistory[index].groupname,
      ispaid: nextHistory[index].ispaid,
    };

    axios.put(`http://localhost:3000/api/history?type=${type}`, historyData)
    .then(res => {
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

    console.log('this.props', this.props)
    console.log(this.state.eventList)
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

    console.log('history?', history, 'this.state.eventList', this.state.eventList)
    history.forEach((eventItem, index) => {
      if (eventItem.email !== this.props.myEmail) { // to hide me as a recipient in the history
        let editButton;
        let imgUrl = '';
        if (eventItem.isadmin) {
          editButton = <input type="button" value="eventEdit" onClick={this.handleEditEvent} />;
        }
        else {
          editButton = '';
        }

        if (eventItem.ispaid) {
            imgUrl = 'http://findicons.com/files/icons/808/on_stage/128/symbol_check.png';
          }
        else {
          imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/X_mark.svg/896px-X_mark.svg.png';
        }
        eventList.push(
        <tr>
          <td>{eventItem.groupname}</td>
          <td>{eventItem.eventname}</td>
          <td>{eventItem.date}</td>
          <td>{eventItem.username} ({eventItem.email})</td>
          <td>{eventItem.cost}</td>
          <td><Link to={"history/"+JSON.stringify({
              groupname : eventItem.groupname,
              eventname : eventItem.eventname,
              date : eventItem.date,
              recipient : eventItem.username,
              email : eventItem.email,
            })}>
            {editButton}</Link>
          </td>
          <td ><img src={imgUrl} onClick={(event) => this.handleDone(event,index)}
            className="toggleImg" /></td>
        </tr>);
      }
    });

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
