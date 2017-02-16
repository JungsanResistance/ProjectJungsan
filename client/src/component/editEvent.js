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
    }

    this.selectHandleChange = this.selectHandleChange.bind(this);
    this.selectHandleMember = this.selectHandleMember.bind(this);
  }

  componentWillMount() {

    const selectedEventData = JSON.parse(this.props.params.eventInfo);
    const getGroupData = axios.get('http://localhost:3000/api/transaction?type=post');
    const getEventData = axios.get(`http://localhost:3000/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`);
    Promise.all([getGroupData, getEventData])
    .then(res => {
      const groupContents = JSON.parse(res[0].data)
      const eventContents = JSON.parse(res[1].data);
      const totalCost = eventContents.participants.reduce((total, member) => {
        return total.cost + member.cost;
      })

      console.log(groupContents, eventContents.groupname)

      const selectedGroupList = groupContents.filter((member) => {
        console.log(member.groupname)
        return member.groupname === eventContents.groupname;
      });

      console.log(selectedGroupList)

      selectedGroupList.forEach((member) => {
        eventContents.participants.forEach((selectedMember) => {
            if(member.email === selectedMember.email) {
              member.selected = true ;
            } else {
              member.selected = false;
            }
        });
      });

      console.log('groupContents', selectedGroupList);

      this.setState({
        groupname: eventContents.groupname,
        eventname : eventContents.eventname,
        date : eventContents.date,
        newrecipient: eventContents.newrecipient,
        oldrecipient: eventContents.oldrecipient,
        participants: eventContents.participants,
        totalCost: totalCost,
        groupMemberList: selectedGroupList,
      })
    })
  }

  selectHandleChange(event) {
    console.log(event.target.value);
  }

  selectHandleMember(event, selectedMember) {

    let copyGroupMemberList = this.state.groupMemberList.map((member) => {
      return member;
    });
    copyGroupMemberList.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;
      }
    });

    const nextParticipants = copyGroupMemberList.filter((member) => {
      return member.selected === true;
    });

    let count = 0;
    if (this.state.nextparticipants) {
      count = this.state.nextparticipants
    } else {
      count = 1
    }

    const indivCost = this.state.totalCost / count;
    for (let member in nextparticipants) {
      nextparticipants[member].cost = indivCost
    }

    this.setState({
      participants: nextParticipants,
      groupMemberList: copyGroupMemberList,
    })

  }




  render() {
    // console.log('eventInfo:::::', this.props.params.eventInfo)
    console.log('stateData!!!!!!:::', this.state)

    const recipientList = this.state.participants.map(member => {
      if(member.email !== this.state.newrecipient.email) {
        return <option>{member.username}</option>
      }
    })
    console.log(this.state.groupMemberList)
    let userTable;
      if (Object.keys(this.state.groupMemberList).length > 0) {
        userTable = this.state.groupMemberList.map((member, index) => {
          console.log(member.selected)
          if (member.selected) {
            return (
              <tr onClick={() => this.selectHandleMember(event, member)} className="selected">
                <td>
                 {member.username} ({member.email})
              </td>
                <input
               type='number' placeholder={this.state.groupMemberList[index].cost}
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
        누구랑 :
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
