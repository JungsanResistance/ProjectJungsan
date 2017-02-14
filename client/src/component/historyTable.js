import React from 'react';
import Router, { browserHistory } from 'react-router';

export default class HistoryTable extends React.Component {
  constructor() {
    super();
    this.state = {
      tableName: '',
      eventList: [],
    }
  }
  componentDidMount() {

  }
  render() {
    console.log('this.props', this.props)
    console.log(this.state.eventList)

    let editButton = '';
    let history, tableName;

    if (this.props.debtHistory) {
      history = this.props.debtHistory;
      tableName = '줘야함';
    }
    else {
      history = this.props.loanedHistory;
      tableName = '받아야함';
    }

    console.log('history?', history, 'this.state.eventList', this.state.eventList)
    history.forEach((event, index) => {
      if (event.email !== this.props.myEmail) { // to hide me as a recipient in the history
        let imgUrl = '';

        if (event.isadmin) {
          editButton = <input type="button" value="eventEdit" onClick={this.handleEditEvent} />;
        }
        else {
          editButton = '';
        }

        if (event.ispaid) {
            imgUrl = 'http://findicons.com/files/icons/808/on_stage/128/symbol_check.png';
          }
          else {
            imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/X_mark.svg/896px-X_mark.svg.png';
          }
          // console.log(event);
          this.state.eventList.push(
            <tr>
              <td>{event.groupname}</td>
              <td>{event.eventname}</td>
              <td>{event.date}</td>
              <td>{event.username} ({event.email})</td>
              <td>{event.cost}</td>
              <td>{editButton}</td>
              <td ><img src={imgUrl} onClick={() => this.handleDone(index)}
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
        {this.state.eventList}
      </div>
    );
  }
}
