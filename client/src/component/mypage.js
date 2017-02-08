import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import SignOut from './signOut';


export default class Mypage extends React.Component {
  constructor() {
    super();
    this.state = {
      groupList:[]
    };
  }
  componentWillMount() {
    axios.get('http://localhost:3000/api/mypage')
    .then((res) => {
      console.log(res.data);
      // console.log("axios get request here")
      const getData = JSON.parse(res.data);
      const groupStorage = [];
      getData.groupList.forEach((group) => {
        groupStorage.push(group.groupname);
      });

      this.setState({
        groupList: groupStorage,
        sumList: getData.sumList,
      });
    });
  }
  render() {
    // console.log('this.state?', this.state)
    const List = [];

    const {
      groupList,
      sumList,
    } = this.state;
    // console.log('sumlist?', sumList)
    if (sumList) {
      sumList.forEach(data =>
        List.push(
          <tr>
            <td>{data.username}</td>
            <td>{data.cost}</td>
          </tr>,
        ));
    }

    const groups = this.state.groupList.map((data) => {
      console.log(data);
      console.log(typeof data)
      return <p><Link to={"grouppage/"+data}>{data}</Link></p>;
    });

    return (
      <div>
        <Link to="history">history</Link>
        <br />
        <Link to="transaction">transaction</Link>
        <br />
        <Link to="group">newgroup</Link>
        <h1>my Page</h1>
        <table className="sumListTable">
          <tr>
            <th>name</th>
            <th>cost</th>
          </tr>
          {List}
        </table>
        <h1>Group List</h1>
        {groups}
        <br />
        <SignOut />
      </div>
    );
  }
}
