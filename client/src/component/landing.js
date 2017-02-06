import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';

export default class Landing extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  componentWillMount() {
    axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/')
    .then(res => {
      const getData = JSON.parse(res.data);
      const groupStorage = [];
      getData.groupList.forEach((group) => {
        groupStorage.push(group.groupname);
      })

      this.setState({
         groupList: groupStorage,
         sumList: getData.sumList
       })
    })
  }
  render () {
    const List = [];
    const {
      groupList,
      sumList,
    } = this.state;
    if (sumList) {
      sumList.forEach((data) =>
        List.push(
          <tr>
            <td>{data.username}</td>
            <td>{data.cost}</td>
          </tr>
        ));
    }

    return (
      <div>
        <Link to="history">history</Link>
        <br/>
        <Link to="transaction">transaction</Link>
        <h1>my Page</h1>
        <table className="sumListTable">
          <tr>
            <th>name</th>
            <th>cost</th>
          </tr>
          {List}
        </table>

        <h1>Group List</h1>
        {this.props.groupList}
      </div>
    )
  }
}
