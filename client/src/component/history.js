import React from 'react';
import axios from 'axios';

export default class History extends React.Component {

  constructor(props){
    super();
    this.state = {
      history: [],
    }
  }
  componentWillMount() {
    axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/history')
    .then( res => {
      // console.log(res);
      const getData = JSON.parse(res.data);
      // console.log(getData);
      this.setState({
        history: getData
      })
    })
  }

  render() {
    const result = [];
    this.state.history.forEach( (data,index) => {
      let imgUrl ='';
      if(data.ispaid) {
        imgUrl = 'http://findicons.com/files/icons/808/on_stage/128/symbol_check.png';
      }
      result.push(
        <tr>
          <td>{data.groupname}</td>
          <td>{data.eventname}</td>
          <td>{data.date}</td>
          <td>{data.username}</td>
          <td>{data.cost}</td>
          <td><img src={imgUrl}/></td>
        </tr>)
    })
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
    )
  }
};
