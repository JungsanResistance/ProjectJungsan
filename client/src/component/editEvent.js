import React from 'react';
import Router, { browserHistory } from 'react-router';
import moment from 'moment';
import axios from 'axios';

export default class EditEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      groupname: '',
      eventname: '',
      date: '',
      newrecipient: {},
      oldrecipient: {},
      participants: [],
      groupMemberList: [],
      totalCost: 0,
    };

    this.selectHandleChange = this.selectHandleChange.bind(this);
    this.selectHandleMember = this.selectHandleMember.bind(this);
  }

  componentWillMount() {
    const selectedEventData = JSON.parse(this.props.params.eventInfo);
    console.log('param data', selectedEventData);

    // all groups I belong info
    const getGroupData = axios.get('http://localhost:3000/api/transaction?type=post');

    // Event info
    const getEventData = axios.get(`http://localhost:3000/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`);

    Promise.all([getGroupData, getEventData])
    .then((res) => {
      const groupContents = JSON.parse(res[0].data);
      const eventContents = JSON.parse(res[1].data);
      console.log('groupContents', groupContents)
      console.log('Ev', eventContents)

      console.log(eventContents.participants)
      // calculate the total cost
      const totalCost = eventContents.participants.reduce((total, member) => {
        return total + member.cost;
      }, 0);
      let selectedGroupMember = groupContents.filter((member) => {
        return member.groupname === eventContents.groupname;
      });
      console.log('1nd selectedGroupMember', selectedGroupMember);
      const storage = [];
      selectedGroupMember = selectedGroupMember.forEach((member) => {
        storage.push({
          email: member.email,
          username: member.username,
          selected: false,
          cost: 0,
        });
      });
      console.log(storage);
      storage.forEach((member) => {
        eventContents.participants.forEach((selectedMember) => {
            if (member.email === selectedMember.email) {
              console.log(member.email, selectedMember.email)
              console.log(selectedMember.cost)
              member.selected = true;
              member.cost = selectedMember.cost;
              console.log(member)
            }
        });
      });
      console.log('2nd selectedGroupMember', storage)

      let newrecipientInfo;

      if (eventContents.newrecipient) {
        newrecipientInfo = eventContents.newrecipient;
      } else {
        newrecipientInfo = '';
      }


      this.setState({
        groupname: eventContents.groupname,
        eventname: eventContents.eventname,
        date: eventContents.date,
        newrecipient: newrecipientInfo,
        oldrecipient: eventContents.oldrecipient,
        participants: eventContents.participants,
        totalCost: totalCost,
        groupMemberList: storage,
      });
    });
  }

  selectHandleChange(event) {
    console.log(event.target.value);
  }

  selectHandleMember(event, selectedMember) {

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

    const indivCost = this.state.totalCost / count;
    console.log(indivCost, this.state.totalCost)
    nextParticipants.forEach((member) => {
      member.cost = indivCost;
    });

    nextGroupMemberList.forEach((member) => {
      if (member.selected) {
        member.cost = indivCost;
      }
    });

    this.setState({
      participants: nextParticipants,
      groupMemberList: nextGroupMemberList,
    })
  }

  render() {
    // console.log(this.state.newrecipient)
      const recipientList = this.state.participants.map((member) => {
        if (member.email !== this.state.newrecipient.email) {
          return <option>{member.username}</option>
        }
      })


    let userTable;
    console.log(this.state.groupMemberList);
    console.log(this.state.totalCost)
    if (Object.keys(this.state.groupMemberList).length > 0 && this.state.totalCost > 0) {
      userTable = this.state.groupMemberList.map((member, index) => {
        console.log('member', member)
        if (member.selected) {
          return (
            <tr onClick={() => this.selectHandleMember(event, member)} className="selected">
              <td>
               {member.username} ({member.email})
            </td>
              <input
             type="number" placeholder={this.state.groupMemberList[index].cost}
             />
            </tr>);
        } else {
          return (
            <tr onClick={() => this.selectHandleMember(event, member)} className="unselected">
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
          type="text" className={this.state.eventNameStyle} placeholder={this.state.eventname}
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
        <input type="button" className="inputData" value="이벤트 수정" onClick={this.blankCheck} />
        <br />
        <br />
      </div>
    )
  }
}
