import React from 'react';
import Router, { browserHistory } from 'react-router';
import moment from 'moment';
import axios from 'axios';

export default class EditEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      groupname: '',
      oldeventname: '',
      neweventname: '',
      olddate: '',
      newdate: '',
      newrecipient: {},
      oldrecipient: {},
      participants: [],
      oldparticipants: [],
      groupMemberList: [],
      totalCost: 0,
      errorMesseage: '',
    };

    this.selectHandleChange = this.selectHandleChange.bind(this);
    this.selectHandleMember = this.selectHandleMember.bind(this);
    this.inputHandleChange = this.inputHandleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    const selectedEventData = JSON.parse(this.props.params.eventInfo);

    // all groups I belong info
    const getGroupData = axios.get('http://localhost:3000/api/transaction?type=post');

    // Event info
    const getEventData = axios.get(`http://localhost:3000/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`);

    Promise.all([getGroupData, getEventData])
    .then((res) => {
      const groupContents = JSON.parse(res[0].data);
      const eventContents = JSON.parse(res[1].data);

      // calculate the total cost
      const totalCost = eventContents.participants.reduce((total, member) => {
        return total + member.cost;
      }, 0);
      let selectedGroupMember = groupContents.filter((member) => {
        return member.groupname === eventContents.groupname;
      });

      // storage to contain necessary member info
      const storage = [];
      selectedGroupMember = selectedGroupMember.forEach((member) => {
        storage.push({
          email: member.email,
          username: member.username,
          selected: false,
          cost: 0,
          ispaid: false,
        });
      });

      // here we filter matching participated member and set selected flag to true
      storage.forEach((member) => {
        eventContents.participants.forEach((selectedMember) => {
          if (member.email === selectedMember.email) {
            member.selected = true;
            member.cost = selectedMember.cost;
          }
          if(selectedMember.email === eventContents.oldrecipient.email) {
            member.ispaid = true;
          }
        });

      });

      // here we prevent the error when eventContents has no newrecipent....
      // eventually we need to delete this part
      let newrecipientInfo;

      if (eventContents.newrecipient) {
        newrecipientInfo = eventContents.newrecipient;
      } else {
        newrecipientInfo = '';
      }

      console.log('eventContents:::::', eventContents)
      this.setState({
        groupname: eventContents.groupname,
        oldeventname: eventContents.eventname,
        neweventname: eventContents.eventname,
        olddate: eventContents.date,
        newdate: eventContents.date,
        newrecipient: eventContents.newrecipient,
        oldrecipient: eventContents.oldrecipient,
        participants: eventContents.participants,
        oldparticipants: eventContents.participants,
        totalCost: totalCost,
        groupMemberList: storage,
      });
    });
  }

  handleSubmit() {
    console.log({
      olddate: this.state.olddate,
      newdate: this.state.newdate,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.groupname,
      oldeventname: this.state.oldeventname,
      neweventname: this.state.neweventname,
      participants: this.state.participants,
    });

    let nothingChangedCount = 0
    if (this.state.olddate !== this.state.newdate) {
      nothingChangedCount += 1;
    }
    if (this.state.oldrecipient.email !== this.state.newrecipient.email) {
      nothingChangedCount += 1;
    }
    if (this.state.oldeventname !== this.state.neweventname) {
      nothingChangedCount += 1;
    }
    if (JSON.stringify(this.state.participants) !== JSON.stringify(this.state.oldparticipants)) {
      nothingChangedCount += 1;
    }

    if (!nothingChangedCount) {
      alert('변경된 이벤트 정보가 없습니다');
      browserHistory.push('/history')
    } else {
    axios.put(`http://localhost:3000/api/transaction`,
      {
        olddate: this.state.olddate,
        newdate: this.state.newdate,
        oldrecipient: this.state.oldrecipient,
        newrecipient: this.state.newrecipient,
        groupname: this.state.groupname,
        oldeventname: this.state.oldeventname,
        neweventname: this.state.neweventname,
        participants: this.state.participants,
      })
      .then((res) => {
        if (res.status === 200) {
          alert('이벤트가 수정되었습니다.')
          browserHistory.push('/history');
        }
        else if (res.status === 401) {
          alert('이벤트 수정권한이 없어요ㅠ');
          browserHistory.push('/history');
        }
        else {
          console.log('시스템 오류...')
        }
      });
    }
  }

  inputHandleChange(event) {
    if (event.target.type === 'number') {
      const nextParticipants = this.state.participants.map((member) => {
        return member;
      })


      console.log('nextParticipants::::', nextParticipants)

      let indivCost
      console.log(this.state.participants)
      if (this.state.participants.length > 0) {
        indivCost = 100 * Math.ceil((event.target.value / (this.state.participants.length * 100)));
      }
      nextParticipants.forEach((member) => {
        member.cost = indivCost;
      });

      const nextGroupMemberList = this.state.groupMemberList.map((member) => {
        return member;
      })
      console.log('nextGroupMemberList::::', nextGroupMemberList)

      nextGroupMemberList.forEach((member) => {
        nextParticipants.forEach((participant) => {
          if(member.email === participant.email) {
            member.cost = indivCost;
          }
        });
      });
      console.log('nextGroupMemberList::::', nextGroupMemberList)


      //  = Object.assign({}, this.state.myAllGroupUserData);
      // for (let member in nextMyAllGroupUserData[this.state.selectedGroup]) {
      //   nextMyAllGroupUserData[this.state.selectedGroup][member].cost = indivCost;
      // }
      this.setState({
        participants: nextParticipants,
        groupMemberList: nextGroupMemberList,
      })

    }
    else if (event.target.type === 'date') {
      this.setState({
        newdate: event.target.value,
        dateStyle: '',
      });
    }
    else if (event.target.type === 'text') {
      this.setState({
        neweventname: event.target.value,
        eventNameStyle: '',
      });
    }
  }

  selectHandleChange(event) {

    const nextParticipants = this.state.participants.map((member) => {
      return member;
    })
    let nextNewRecipient ;
    nextParticipants.forEach((member, index) => {
      if(member.username === event.target.value) {
        member.ispaid = true;
        nextNewRecipient = nextParticipants[index]
      }
      else if(member.email === this.state.newrecipient.email) {
        member.ispaid = false;
      }
    })
    console.log(nextNewRecipient, nextParticipants)
    this.setState({
      newrecipient: nextNewRecipient,
      participants: nextParticipants,
    })


    console.log(event.target.value);
  }

  selectHandleMember(event, selectedMember) {

    console.log(selectedMember)

    // deep copy
    let nextGroupMemberList = this.state.groupMemberList.map((member) => {
      return member;
    });

    // toggle selected flag
    nextGroupMemberList.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;
      }
    });

    const nextParticipants = nextGroupMemberList.filter((member) => {
      return member.selected === true;
    });


    let count = 0;
    if (nextParticipants) {
      count = nextParticipants.length
    } else {
      count = 1
    }

    const indivCost = 100 * Math.ceil((this.state.totalCost / (count * 100)));

    // const indivCost = this.state.totalCost / count;
    nextParticipants.forEach((member) => {
      member.cost = indivCost;
    });

    nextGroupMemberList.forEach((member) => {
      if (member.selected) {
        member.cost = indivCost;
      }
    });

    let clearNewrecipient = this.state.newrecipient;

    if(this.state.newrecipient.email === selectedMember.email){
      if(!selectedMember.selected) {
        clearNewrecipient = {username: '정산자 선택!'}
      }
    }

    this.setState({
      participants: nextParticipants,
      groupMemberList: nextGroupMemberList,
      newrecipient: clearNewrecipient
    });
  }

  render() {
    console.log("state::::",this.state)
    const recipientList = this.state.participants.map((member) => {
      if (member.email !== this.state.newrecipient.email) {
        return <option>{member.username}</option>
      }
    });


    let userTable;
    if (Object.keys(this.state.groupMemberList).length > 0 && this.state.totalCost > 0) {
      userTable = this.state.groupMemberList.map((member, index) => {
        if (member.selected) {
          return (
            <tr onClick={(event) => this.selectHandleMember(event, member)} className="selected">
              <td>
               {member.username} ({member.email})
            </td>
              <input
             type="number" placeholder={this.state.groupMemberList[index].cost}
             />
            </tr>);
        } else {
          return (
            <tr onClick={(event) => this.selectHandleMember(event, member)} className="unselected">
              <td>
                {member.username} ({member.email})
           </td>
         </tr>);
        }
      })
    }
    else {
      userTable = [];
    }

    return (
      <div>
        <p>
        그룹 :
        {this.state.groupname}
        </p>
        <p>
        언제 :
        <input
          name="eventDate" className={this.state.dateStyle} type="date"
          onChange={this.inputHandleChange} />
        </p>
        <p>
        어디서 :
        <input
          type="text" className={this.state.eventNameStyle} placeholder={this.state.oldeventname}
          onChange={this.inputHandleChange} />
        </p>
        <p>
        돈 낸 사람 :
        <select
          name="recipientList" className={this.state.recipientStyle}
          onChange={this.selectHandleChange} >
          <option>{this.state.newrecipient.username}</option>
          {recipientList}
        </select>
        </p>
        <p>
        총액 :
        <input
          name="eventCost" className={this.state.costStyle} type="number"
          placeholder={this.state.totalCost} onChange={this.inputHandleChange} />
        </p>
        <p>
        누구랑 :
        <table>
          {userTable}
        </table>
        </p>
        <br />
        <input type="button" className="inputData" value="이벤트 수정" onClick={this.handleSubmit} />
        <br />
        <br />
      </div>
    );
  }
}
