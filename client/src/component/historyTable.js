import React from 'react';
import Router, { browserHistory, Link } from 'react-router';
import axios from 'axios';

export default class HistoryTable extends React.Component {
  constructor() {
    super();
    this.state = {
      tableName: '',
      debtHistory: [],
      loanedHistory: [],
    };
    this.handleDone = this.handleDone.bind(this);
  }
  // handling event transaction finished
  handleDone(event,index) {

    let historyType, type;
    const eventValue = event.target.value;
    let action = 'pending';
    //type값 설정//
    if (this.props.debtHistory) {
      historyType = this.props.debtHistory;
      type = 'debt';
    } else {
      historyType = this.props.loanedHistory;
      type = 'loan';
    }
    //action값 설정//
    if (event.target.value === '수락' || event.target.value === '정산하기') {
      action = 'accept';
    }
    else if (event.target.value === '거절') {
      action = 'reject';
    }

    const nextHistory = [...historyType];
    const historyData = {
      date : nextHistory[index].date,
      recipientemail: nextHistory[index].email,
      eventname: nextHistory[index].eventname,
      groupname: nextHistory[index].groupname,
      ispaid: nextHistory[index].ispaid,
      action: action,
    };

    axios.put(`http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/history?type=${type}`, historyData)
    .then(res => {
      if(res.status === 200) {
        if (eventValue === '정산하기' || eventValue === '수락') {
          alert('정산이 완료되었습니다.');
        }
        else if (eventValue === '정산요청')
          alert('상대방이 정산내역을 확인중입니다.');
      }
    })
    .then(() => {
      return axios.get('http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/history');
    })
    .then((res) => {
      const getData = JSON.parse(res.data);
      if (this.props.debtHistory) {
        this.setState({
          debtHistory: getData.debt,
        });
      }
      else {
        this.setState({
          loanedHistory: getData.loaned,
        });
      }
    });
  }

  render() {
    const eventList = [];
    let editButton = <button className="btn btn-outline-primary">이벤트 정보</button>
    let actionButton = '';
    let history, tableName, tableType;

    if (this.props.debtHistory) {
      if (this.state.debtHistory.length > 0) {
        history = this.state.debtHistory;
      } else {
        history = this.props.debtHistory;
      }
    }
    else {
      if (this.state.loanedHistory.length > 0) {
        history = this.state.loanedHistory;
      } else {
        history = this.props.loanedHistory;
      }
    }
    console.log(history)
//debt와 loaned 구분//
  if (history) {
    history.forEach((eventItem, index) => {
      let declineButton = '';
      if (eventItem.email !== this.props.myEmail) {
        //이벤트 수정권한 추가//

        if (history === this.props.debtHistory || history === this.state.debtHistory) {
          tableName = '줘야함';
          if (!eventItem.ispaid) {
            if (eventItem.status === null || eventItem.status === 3) {
              actionButton =
              <button className="btn btn-outline-success" value='정산요청' onClick={(event) => this.handleDone(event, index)}>정산요청</button>;
            }
            else if (eventItem.status === 1) {
              actionButton =
              <button className="btn btn-outline-info" value='정산중' onClick={(event) => this.handleDone(event, index)}>정산중</button>;
            }
            else {
              actionButton =
              <button className="btn btn-outline-primary" value='정산완료' onClick={(event) => this.handleDone(event, index)}>정산완료</button>;
            }
          } else {
            actionButton =
            <button className="btn btn-outline-primary" value='정산완료' onClick={(event) => this.handleDone(event, index)}>정산완료</button>;
          }
        }
        else {
          tableName = '받아야함';
          if (!eventItem.ispaid) {
            if(eventItem.status === null || eventItem.status === 3) {
              actionButton =
              <button className="btn btn-outline-success" value='정산하기' onClick={(event) => this.handleDone(event, index)}>정산하기</button>;
              declineButton = '';
            }
            else if (eventItem.status === 1) {
              actionButton =
              <button className="btn btn-outline-info" value='수락' onClick={(event) => this.handleDone(event, index)}>수락</button>;
              declineButton =
              <button className="btn btn-outline-info" value='거절' onClick={(event) => this.handleDone(event, index)}>거절</button>;

            }
            else {
              actionButton =
              <button className="btn btn-outline-primary" value='정산완료' onClick={(event) => this.handleDone(event, index)}>정산완료</button>;
            }
          } else {
            actionButton =
            <button className="btn btn-outline-primary" value='정산완료' onClick={(event) => this.handleDone(event, index)}>정산완료</button>;
          }
        }
        eventList.push(
        <tr>
          <td>{eventItem.groupname}</td>
          <td>{eventItem.eventname}</td>
          <td>{eventItem.date}</td>
          <td>{eventItem.username} ({eventItem.email})</td>
          <td>{Math.abs(eventItem.cost)}</td>
          <td>

            <Link to={"eventinfo/"+JSON.stringify({
              groupname: eventItem.groupname,
              eventname: eventItem.eventname,
              date: eventItem.date,
              isadmin: eventItem.isadmin,
            })}>
            {editButton}</Link>

          </td>
          <td >
            {actionButton}
            {declineButton}
          </td>
        </tr>);
      }
    });
  }

    return (
        <div className="container history">
          <h1>
            {tableName}
          </h1>
          <br />
          <div className="col-sm-0"></div>
            <div className="col-sm-12">
            <table className="table table-hover" >
              <thead>
                <tr>
                  <th>groupname</th>
                  <th>eventname</th>
                  <th>date</th>
                  <th>name(email)</th>
                  <th>cost</th>
                  <th>edit</th>
                  <th>status</th>
                </tr>
              </thead>
              <tbody>
              {eventList}
              </tbody>
            </table>
          </div>
          <div className="col-sm-0"></div>
        </div>

    );
  }
}
