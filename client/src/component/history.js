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
