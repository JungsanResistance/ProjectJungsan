import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import SignOut from './signOut';


export default class Mypage extends React.Component {
  constructor() {
    super();
    this.state = {
      groupList: [],
      sumList: [],
      myEmail: '',
    };
    this.handleDone = this.handleDone.bind(this);
  }

  componentWillMount() {
    const myData = axios.get('http://localhost:3000/api/misc');
    const groupData = axios.get('http://localhost:3000/api/mypage');

    Promise.all([myData, groupData]).then(res => {
      const myEmailData = JSON.parse(res[0].data)[0].email
      const groupStorage = [];
      const getData = JSON.parse(res[1].data);

      console.log('getData!!!!!:', getData);

      getData.groupList.forEach((group) => {
        groupStorage.push(group.groupname);
      });

      this.setState({
        groupList: groupStorage,
        sumList: getData.sumList,
        myEmail: myEmailData,
      });
    })
  }

  handleDone(index) {
    const nextSumList = [...this.state.sumList];
    const individualTransacionDone = {
      recipientemail: nextSumList[index].email,
    }

    axios.put(`http://localhost:3000/api/misc`, individualTransacionDone)
    .then((res) => {
      console.log(res);
      if(res.status === 200) {
          nextSumList.splice(index, 1)
          this.setState({
            sumList: nextSumList,
          })
        }
    });
  }

  render() {
    const List = [];
    const {
      groupList,
      sumList,
    } = this.state;
    if (sumList && this.state.myEmail) {
      sumList.forEach((data, index) => {
        console.log(data.email, this.state.myEmail)
        if (data.email !== this.state.myEmail) {
          List.push(
            <tr>
              <td>{data.username}</td>
              <td>{data.email}</td>
              <td>{data.cost}</td>
              <td><button onClick={() => this.handleDone(index)}>정산완료</button></td>
            </tr>,
          )
        }
      });
    }

    const groups = this.state.groupList.map((data) => {
      return <li className="myPageGroupName"><Link to={"grouppage/"+data}>{data}</Link></li>;
    });

    return (
      <div>
        <ul>
          <li className="routing"><Link to="history">history</Link></li>
          <li className="routing"><Link to="transaction">transaction</Link></li>
          <li className="routing"><Link to="group">newgroup</Link></li>
        </ul>
        <br />
          <div className="myPage">
          <h1>my Page</h1>
          <table className="sumListTable">
            <tr>
              <th>name</th>
              <th>email</th>
              <th>cost</th>
              <th></th>
            </tr>
            {List}
          </table>
          <h1>Group List</h1>
          <ul>
            {groups}
          </ul>
          <br />
          <SignOut />
        </div>
      </div>
    );
  }
}
