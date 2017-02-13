import React from 'react';
import axios from 'axios';

export default class History extends React.Component {

  constructor() {
    super();
    this.state = {
      history: [],
      imgUrl: '',
      ispaid: 0,
    };
    this.handleDone = this.handleDone.bind(this);
  }
  componentWillMount() {
    axios.get('http://localhost:3000/api/history')
    .then((res) => {
      // console.log(res);
      const getData = JSON.parse(res.data);
      console.log(getData)
      // const historyData = {
      //   date : getData.date,
      //   recipienteamil: getData.email,
      //   eventname: getData.eventname,
      //   ispaid: getData.ispaid,
      // }
      // console.log('getData', getData);
      this.setState({
        history: getData,
      });
    });
  }

  handleDone(index) {
    const nextHistory = [...this.state.history];
    nextHistory[index].ispaid = !nextHistory[index].ispaid;
    console.log('Here!!!!!!!!:',nextHistory[index])
    // console.log('nextHistory[index]', nextHistory[index])
    const historyData = {
      date : nextHistory[index].date,
      recipienteamil: nextHistory[index].email,
      eventname: nextHistory[index].eventname,
      ispaid: nextHistory[index].ispaid,
    };

    axios.put(`http://localhost:3000/api/history`, historyData)
    .then((res) => {
      console.log(res);
      if(res.status === 200)
        this.setState({
          history: nextHistory,
        })
    });
  }


  render() {
    const result = [];
    this.state.history.forEach((data, index) => {
      let imgUrl = '';
      console.log(data.ispaid)
      if (data.ispaid) {
        imgUrl = 'http://findicons.com/files/icons/808/on_stage/128/symbol_check.png';
      }
      else {
        imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/X_mark.svg/896px-X_mark.svg.png';
      }
      console.log(data);
      result.push(
        <tr>
          <td>{data.groupname}</td>
          <td>{data.eventname}</td>
          <td>{data.date}</td>
          <td>{data.username} ({data.email})</td>
          <td>{data.cost}</td>
          <td ><img src={imgUrl} onClick={() => this.handleDone(index)}
            className="toggleImg" /></td>
        </tr>);
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
            <th>status</th>
          </tr>
          {result}
        </table>
      </div>
    );
  }
}
