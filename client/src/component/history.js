import React from 'react';
import axios from 'axios';
import Router, { browserHistory } from 'react-router';
import HistoryTable from './historyTable';
import Navbar from './func/navbar';

const Loader = require('react-loader');

export default class History extends React.Component {

  constructor() {
    super();
    this.state = {
      debtHistory: [],
      loanedHistory: [],
      imgUrl: '',
      ispaid: 0,
      myEmail: '',
      loaded: false,
    };

    this.handleEditEvent = this.handleEditEvent.bind(this);
  }
  componentWillMount() {
    const myData = axios.get('https://oneovern.com/api/misc');
    const historyData = axios.get('https://oneovern.com/api/history');

    Promise.all([myData, historyData]).then(res => {
      const myEmailData = JSON.parse(res[0].data)[0].email;
      const getData = JSON.parse(res[1].data);
      console.log('getData', getData);
      this.setState({
        debtHistory: getData.debt,
        loanedHistory: getData.loaned,
        myEmail: myEmailData,
      });
    })
    .then(() => {
      this.setState({
        loaded: true,
      });
    });
  }
  // edit single event // under the consturction
  handleEditEvent() {
    browserHistory.push('/editEvent');
  }

  render() {
    return (
      <div className="historyTable">
        <Navbar />
        <Loader loaded={this.state.loaded}>
        <table className="table">
          <HistoryTable debtHistory={this.state.debtHistory} myEmail={this.state.myEmail} />
          <br />
          <br />
          <HistoryTable loanedHistory={this.state.loanedHistory} myEmail={this.state.myEmail} />
        </table>
        </Loader>
      </div>
    );
  }
}
