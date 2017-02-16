import React from 'react';
import moment from 'moment';
import axios from 'axios';
import Router, { browserHistory } from 'react-router'

export default class NewTransaction extends React.Component {
  constructor() {
    super();
    this.state = {
      groupname: '',
      selectedGroup: '',
      selectedUserListToBeSent: [],
      eventName: '',
      date: '',
      newrecipient: {},
      oldrecipient: {},
      totalCost: 0,
      myAllGroupUserData: {},
      allPastEvents: [],
      errorMesseage: '',
      groupMemberErrorMesseage: '',
      eventErrorMesseage: '',

      groupStyle: '',
      dateStyle: '',
      eventNameStyle: '',
      recipientStyle: '',
      costStyle: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.selectHandleChange = this.selectHandleChange.bind(this);
    this.inputHandleChange = this.inputHandleChange.bind(this);
    this.selectHandleMember = this.selectHandleMember.bind(this);
    this.blankCheck = this.blankCheck.bind(this);
    this.eventDuplicateCheck = this.eventDuplicateCheck.bind(this);
  }
  componentWillMount() {
    const getGroupData = axios.get('http://localhost:3000/api/transaction?type=post');
    const getAllEvents = axios.get('http://localhost:3000/api/history');
    Promise.all([getGroupData, getAllEvents]).then((res) => {
      const getData = JSON.parse(res[0].data);
      const getHistory = JSON.parse(res[1].data);
      const groupStorage = {};
      getData.forEach((item) => {
        groupStorage[item.groupname] = [];
      });
      getData.forEach((item) => {
        groupStorage[item.groupname].push({
          username: item.username,
          email: item.email,
          cost: 0,
          ispaid: false,
          selected: false,
        });
      });
      console.log(getData)
      console.log('groupStorage:', groupStorage )
      console.log()
      console.log(getHistory)

      const allEvents = getHistory.debt.concat(getHistory.loaned)

      this.setState({
        myAllGroupUserData: groupStorage,
        allPastEvents: allEvents,
      });
    });
  }

  blankCheck() {
    let count = 0;
    let groupMemberCount = 0;
    let nextGroupStyle, nextDateStyle, nextEventNameStyle, nextNewRecipientStyle, nextCostStyle;

    if (this.state.selectedGroup === '') {
      nextGroupStyle = 'inputStyle';
      count += 1;
    }
    if (this.state.date === '') {
      nextDateStyle = 'inputStyle';
      count += 1;
    }
    if (!this.state.eventName.length) {
      nextEventNameStyle = 'inputStyle';
      count += 1;
    }
    if (!Object.keys(this.state.newrecipient).length) {
      nextNewRecipientStyle = 'inputStyle';
      count += 1;
    }
    if (!(this.state.totalCost > 0)) {
      nextCostStyle = 'inputStyle';
      count += 1;
    }
    console.log('selectedUserListToBeSent::', this.state.selectedUserListToBeSent)
    if (this.state.selectedUserListToBeSent.length === 0) {
      groupMemberCount += 1;
    }

    this.setState({
      groupStyle: nextGroupStyle,
      dateStyle: nextDateStyle,
      eventNameStyle: nextEventNameStyle,
      recipientStyle: nextNewRecipientStyle,
      costStyle: nextCostStyle,
    });

    console.log('groupMemberCount ::::', groupMemberCount)

    if (!count && !groupMemberCount) {
      this.handleSubmit();
    } else {
      if (count) {
        this.setState({
          errorMesseage: '빈칸을 모두 채워주세요 ㅠ',
        });
      }
      if (groupMemberCount) {
        this.setState({
          groupMemberErrorMesseage: '함께 식사한 친구들을 선택해주세요',
        });
      }
    }
  }

  handleSubmit() {
    axios.post('http://localhost:3000/api/transaction', {
      date: this.state.date,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.selectedGroup,
      eventname: this.state.eventName,
      participants: this.state.selectedUserListToBeSent,
    })
    .then((res) => {
      if (res.status === 201) {
        alert('이벤트가 등록되었습니다.');
        browserHistory.push('/mypage');
      } else {
        alert('빈칸을 확인해주세요 ^^');
        console.log('post response:', res);
      }
    });
  }

  selectHandleMember(event,selectedMember) {
    const nextSelectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup].map((member) => {
      return member;
    });

    nextSelectedGroupMember.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;
      }
    });

    const nextSelectedUserListToBeSent = nextSelectedGroupMember.filter((member) => {
      return member.selected === true;
    });

    //not state...//
    const newSelectedUserList = Object.assign({}, this.state.newSelectedUserList)

    let count = 0;
    if (this.state.selectedGroupMember) {
      this.state.selectedGroupMember.forEach((member) => {
        if (member.selected) {
          count += 1;
        }
      });
    } else {
      count = 1;
    }

    const indivCost = this.state.totalCost / count;
    for (let member in newSelectedUserList) {
      newSelectedUserList[member].cost = indivCost
    }

    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData)
    for (let member in nextMyAllGroupUserData[this.state.selectedGroup]) {
      nextMyAllGroupUserData[this.state.selectedGroup][member].cost = indivCost
    }

    if (this.state.groupMemberErrorMesseage.length) {
      this.setState({
        selectedGroupMember: nextSelectedGroupMember,
        selectedUserListToBeSent: nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
        groupMemberErrorMesseage: '',
      });
    } else {
      this.setState({
        selectedGroupMember: nextSelectedGroupMember,
        selectedUserListToBeSent: nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
      });
    }
  }

  selectHandleChange(event) {

    if (this.state.errorMesseage.length) {
      this.setState({
        errorMesseage: '',
      });
    }

    if (event.target.name === 'eventGroup') {
      this.eventDuplicateCheck(event);
      if (event.target.value === 'select the group') {
        this.setState({
          selectedGroup: '',
          selectedUserListToBeSent: [],
          groupStyle: '',
        });
      }
      else if (event.target.value) {
        this.setState({
          selectedGroup: event.target.value,
          groupStyle: '',
        });
      }
    }
    else if (event.target.name === 'recipientList') {
        if (event.target.value === "select the recipient") {
          this.setState({
            newrecipient: {},
            groupMemberErrorMesseage: '',
          });
        }
      this.state.myAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
        if (member.username === event.target.value) {
          const nextNewRecipient = Object.assign({}, this.state.myAllGroupUserData[this.state.selectedGroup][index])
          nextNewRecipient.ispaid = true;
          this.setState({
            newrecipient: nextNewRecipient,
            oldrecipient: nextNewRecipient,
            recipientStyle: '',
          });
        }
      });
    }
  }

  eventDuplicateCheck(event) {
    let eventDuplicateExist = false;
    if (event.target.name === 'eventGroup') {
      this.state.allPastEvents.forEach((pastEvent) => {
        if (pastEvent.groupname === event.target.value &&
          pastEvent.date === this.state.date &&
          pastEvent.eventname === this.state.eventName) {
          eventDuplicateExist = true;
        }
      });
    }
    else if (event.target.type === 'date') {
      this.state.allPastEvents.forEach((pastEvent) => {
        if (pastEvent.groupname === this.state.selectedGroup &&
          pastEvent.date === event.target.value &&
          pastEvent.eventname === this.state.eventName) {
          eventDuplicateExist = true;
        }
      });
    }
    else if (event.target.type === 'text') {
      this.state.allPastEvents.forEach((pastEvent) => {
        if (pastEvent.groupname === this.state.selectedGroup &&
          pastEvent.date === this.state.date &&
          pastEvent.eventname === event.target.value) {
          eventDuplicateExist = true;
        }
      });
    }

    if (eventDuplicateExist) {
      this.setState({
        eventErrorMesseage: '중복된 이벤트가 있습니다',
      });
    } else {
      this.setState({
        eventErrorMesseage: '',
      });
    }
  }

  inputHandleChange(event) {
    if (this.state.errorMesseage.length) {
      this.setState({
        errorMesseage: '',
      });
    }

    if (event.target.type === 'date') {
      this.eventDuplicateCheck(event);
      this.setState({
        date: event.target.value,
        dateStyle: '',
      });
    }
    else if (event.target.type === 'number') {
      const newSelectedUserList = Object.assign({}, this.state.newSelectedUserList)
      let count = 0;
      if (this.state.selectedGroupMember) {
        this.state.selectedGroupMember.forEach((member) => {
          if (member.selected) {
            count += 1;
          }
        });
      } else {
        count = 1;
      }

      const indivCost = event.target.value / count;
      for (let member in newSelectedUserList) {
        newSelectedUserList[member].cost = indivCost
      }

      const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
      for (let member in nextMyAllGroupUserData[this.state.selectedGroup]) {
        nextMyAllGroupUserData[this.state.selectedGroup][member].cost = indivCost;
      }

      this.setState({
        totalCost: parseInt(event.target.value),
        selectedUserListToBeSent: newSelectedUserList,
        myAllGroupUserData: nextMyAllGroupUserData,
        costStyle: '',
      });
    }
    else if (event.target.type === 'text') {
      this.eventDuplicateCheck(event);
      this.setState({
        eventName: event.target.value,
        eventNameStyle: '',
      });
    }
  }

  render() {
    console.log(this.state.myAllGroupUserData)
    const getGroupKeyArray = Object.keys(this.state.myAllGroupUserData);
    console.log(getGroupKeyArray)
    const groupSelection = getGroupKeyArray.map((item) => {
      return <option>{item}</option>;
    });
    // console.log("getGroupKeyArray::",getGroupKeyArray)
    // console.log("groupSelection:::", groupSelection)

    let userTable;
    const selectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup];
    if (Object.keys(this.state.myAllGroupUserData).length > 0 && this.state.selectedGroup.length > 0 ) {
      userTable = selectedGroupMember.map((member, index) => {
        if (selectedGroupMember[index].selected) {
          return (
            <tr onClick={() => this.selectHandleMember(event, member)} className="selected">
              <td>
               {member.username} ({member.email})
            </td>
              <input
             type='number' placeholder={this.state.myAllGroupUserData[this.state.selectedGroup][index].cost}
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
      });
    }
    else {
      userTable = [];
    }

    let recipientTable;

    if (this.state.selectedGroup.length) {
      recipientTable = this.state.myAllGroupUserData[this.state.selectedGroup].map((member) => {
        return <option>{member.username}</option>;
      });
    } else {
      recipientTable = [];
    }

    return (
      <div>
          그룹을 선택해주세요 :
          <select
            name="eventGroup" className={this.state.groupStyle}
            onChange={this.selectHandleChange}>
            <option>select the group</option>
            {groupSelection}
          </select>
          <br />
          <br />
          <p>
          언제 :
          <input
            name="eventDate" className={this.state.dateStyle} type="date"
            placeholder={moment().format('YYYY-MM-DD')}
            onChange={this.inputHandleChange} />
        </p>
          <p>
            어디서 :
            <input
              type="text" className={this.state.eventNameStyle} placeholder="where did you eat?"
              onChange={this.inputHandleChange} />
              {this.state.eventErrorMesseage}
          </p>

          돈 낸 사람 :
          <select
            name="recipientList" className={this.state.recipientStyle}
            onChange={this.selectHandleChange}>
            <option>select the recipient</option>
            {recipientTable}
          </select>
          <p>
            총액 :
            <input
              name="eventCost" className={this.state.costStyle} type="number"
              onChange={this.inputHandleChange} />
          </p>
          <br />
          누구랑 :
          <table>
            {userTable}
          </table>
          <br />
          <br />
          {this.state.groupMemberErrorMesseage}
          <br />
          <input type="button" className="inputData" value="이벤트 등록" onClick={this.blankCheck} />
          <br />
          <br />
          {this.state.errorMesseage}
      </div>
    );
  }
}
