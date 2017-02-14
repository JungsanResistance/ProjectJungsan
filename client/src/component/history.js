import React from 'react';
import axios from 'axios';
import Router, { browserHistory } from 'react-router'

export default class History extends React.Component {

  constructor() {
    super();
    this.state = {
      history: [],
      imgUrl: '',
      ispaid: 0,
      myEmail: '',
    };
    this.handleDone = this.handleDone.bind(this);
    this.handleEditEvent = this.handleEditEvent.bind(this);
  }
  componentWillMount() {

    const myData = axios.get('http://localhost:3000/api/misc');
    const historyData = axios.get('http://localhost:3000/api/history');

    Promise.all([myData, historyData]).then(res => {
      const myEmailData = JSON.parse(res[0].data)[0].email;
      const getData = JSON.parse(res[1].data);

        this.setState({
          history: getData,
          myEmail: myEmailData,
        });
    })
  }
  // edit single event
  handleEditEvent() {
    browserHistory.push('/editEvent');
  }
  // handling event transaction finished
  handleDone(index) {
    const nextHistory = [...this.state.history];
    nextHistory[index].ispaid = !nextHistory[index].ispaid;
    // console.log('Here!!!!!!!!:',nextHistory[index])
    // console.log('nextHistory[index]', nextHistory[index])
    console.log(nextHistory[index].ispaid)
    console.log("Here!",nextHistory[index])
    const historyData = {
      date : nextHistory[index].date,
      recipientemail: nextHistory[index].email,
      eventname: nextHistory[index].eventname,
      ispaid: nextHistory[index].ispaid,
    };

    axios.put(`http://localhost:3000/api/history`, historyData)
    .then((res) => {
      if(res.status === 200)
      console.log("Are you come here??");
        this.setState({
          history: nextHistory,
        })
    });
  }


  render() {
    const result = [];
    let editButton = '';

    this.state.history.forEach((event, index) => {
      if (event.email !== this.state.myEmail) { // to hide me as a recipient in the history
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
          result.push(
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
      <div className="historyTable">
        <table className="table">
          <tr>
            <th>groupname</th>
            <th>eventname</th>
            <th>date</th>
            <th>name(email)</th>
            <th>cost</th>
            <th>edit</th>
            <th>status</th>
          </tr>
          {result}
        </table>
      </div>
    );
  }
}
