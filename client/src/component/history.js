import React from 'react';
import axios from 'axios';
import Router, { browserHistory } from 'react-router';
import HistoryTable from './historyTable';

export default class History extends React.Component {

  constructor() {
    super();
    this.state = {
      debtHistory: [],
      loanedHistory: [],
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
        debtHistory: getData.debt,
        loanedHistory: getData.loaned,
        myEmail: myEmailData,
      });
    })
  }
  // edit single event // under the consturction
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

    // update with query string.. type=?
    // axios.put(`http://localhost:3000/api/history`, historyData)
    // .then((res) => {
    //   if(res.status === 200)
    //   console.log("Are you come here??");
    //     this.setState({
    //       history: nextHistory,
    //     })
    // });
  }

  render() {
    return (
      <div className="historyTable">
        <table className="table">
          <HistoryTable debtHistory={this.state.debtHistory} myEmail={this.state.myEmail} />
          <br />
          <br />
          <HistoryTable loanedHistory={this.state.loanedHistory} myEmail={this.state.myEmail} />
        </table>
      </div>
    );
  }
}
