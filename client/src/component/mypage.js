import React from 'react';
import { Link, browserHistory } from 'react-router';
import axios from 'axios';
import SignOut from './signOut';


export default class Mypage extends React.Component {
  constructor() {
    super();
    this.state = {
      groupList: [],
      sumList: [],
      myEmail: '',
      pendingUserList: [],
      testtest: '',
    };
    this.handleDone = this.handleDone.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    this.reset();
    // const myData = axios.get('http://localhost:3000/api/misc');
    // const groupData = axios.get('http://localhost:3000/api/mypage');
    // Promise.all([myData, groupData]).then(res => {
    //   const myEmailData = JSON.parse(res[0].data)[0].email
    //   const groupStorage = [];
    //   const getData = JSON.parse(res[1].data);
    //   // console.log()
    //   console.log('getData!!!!!:', getData);
    //
    //   getData.groupList.forEach((group) => {
    //     groupStorage.push(group.groupname);
    //   });
    //     console.log(getData.pendingUserList)
    //
    //   this.setState({
    //     groupList: groupStorage,
    //     sumList: getData.sumList,
    //     myEmail: myEmailData,
    //     pendingUserList: getData.pendingUserList,
    //   });
    // })
  }

  reset() {
    const myData = axios.get('http://localhost:3000/api/misc');
    const groupData = axios.get('http://localhost:3000/api/mypage');
    Promise.all([myData, groupData]).then((res) => {
      const myEmailData = JSON.parse(res[0].data)[0].email;
      const groupStorage = [];
      const getData = JSON.parse(res[1].data);
      getData.groupList.forEach((group) => {
        groupStorage.push(group.groupname);
      });
      this.setState({
        groupList: groupStorage,
        sumList: getData.sumList,
        myEmail: myEmailData,
        pendingUserList: getData.pendingUserList,
      });
    });
  }

  handleDone(event, index) {
    const nextSumList = [...this.state.sumList];
    //promise callback에 넘기기 위한 변수 지정//
    const eventValue = event.target.value;
    let actionType = 'pending';
    let answer = true;

    if (event.target.value === '수락') {
      actionType = 'accept';
    }
    else if (event.target.value === '거절') {
      actionType = 'reject';
    }

    const individualTransacionDone = {
      recipientemail: nextSumList[index].email,
      action: actionType,
    };

    if (event.target.value === '수락') {
      answer = confirm('정말로 정산을 완료하시겠습니다?');
    }

    if (answer) {
      axios.put(`http://localhost:3000/api/misc`, individualTransacionDone)
      .then((res) => {
        if (res.status === 200) {
          if (eventValue === '정산요청') {
            alert('정산중! 상대가 수락하면 정산이 완료됩니다.');
            browserHistory.push('/mypage');
          }
          else if (eventValue === '거절') {
            browserHistory.push('/mypage');
          }
          else if (eventValue === '수락') {
            nextSumList.splice(index, 1);
            this.setState({
              sumList: nextSumList,
            });
          }
        }
        this.reset();
      });
    }
  }

  render() {
    const List = [];
    const {
      groupList,
      sumList,
    } = this.state;
    let declineButton = '';
    let actionButton = '정산요청';

    if (sumList && this.state.myEmail) {
      sumList.forEach((data, index) => {
        //render all sumlist except me//
        if (data.email !== this.state.myEmail) {
          actionButton = '정산요청';
          this.state.pendingUserList.forEach((member) => {
            if (data.email === member.applicantemail || data.email === member.acceptoremail) {
              // actionButton = '정산요청';
              if (member.applicantemail === this.state.myEmail && member.status === 1) {
                actionButton = '정산중';
              }
              else if (member.status === 1) {
                actionButton = '수락';
                declineButton = <button value='거절' onClick={(event) => this.handleDone(event, index)}>거절</button>
              }
              else if (member.status === null) {
                actionButton = '정산요청';
              }
            }
          });

          List.push(
            <tr>
              <td>{data.username}</td>
              <td>{data.email}</td>
              <td>{data.cost}</td>
              <td>
                <button value={actionButton} onClick={(event) => this.handleDone(event, index)}>{actionButton}</button>
                {declineButton}
              </td>
            </tr>,
          );
        }
      });
    }

    const groups = this.state.groupList.map((data) => {
      return <li className="myPageGroupName"><Link to={"grouppage/"+data}>{data}</Link></li>;
    });

    return (
      <div>
        <ul>
          <li className="routing"><Link to="history">History</Link></li>
          <li className="routing"><Link to="transaction">New event</Link></li>
          <li className="routing"><Link to="group">New group</Link></li>
        </ul>
        <br />
          <div className="myPage">
          <h1>my Page</h1>
          {this.state.testtest}
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
