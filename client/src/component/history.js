import React from 'react';
import axios from 'axios';

export default class History extends React.Component {

  constructor() {
    super();
    this.state = {
      history: [],
      imgUrl: '',
    };
    this.handleDone = this.handleDone.bind(this);
  }
  componentWillMount() {
    axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/history')
    .then((res) => {
      // console.log(res);
      const getData = JSON.parse(res.data);
      // console.log(getData);
      this.setState({
        history: getData,
      });
    });
  }

  handleDone(event) {
    const check = event.target.className;
    if (check) {
      this.setState({

        imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/X_mark.svg/896px-X_mark.svg.png',
      })
    }
    else {
      this.setState({
        imgUrl: 'http://findicons.com/files/icons/808/on_stage/128/symbol_check.png',
      })
    }
  }

  render() {
    const result = [];
    this.state.history.forEach((data, index) => {
      let imgUrl = '';

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
          <td>{data.username}</td>
          <td>{data.cost}</td>
          <td ><img src={this.state.imgUrl} onClick={this.handleDone} className={data.ispaid} /></td>
        </tr>);
    });
    return (
      <div className="historyTable">
        <table className="table">
          <tr>
            <th>groupname</th>
            <th>eventname</th>
            <th>date</th>
            <th>name</th>
            <th>cost</th>
            <th>status</th>
          </tr>
          {result}
        </table>
      </div>
    );
  }
}
