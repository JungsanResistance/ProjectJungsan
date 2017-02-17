import React from 'react';
import moment from 'moment';
import axios from 'axios';
import Router, { browserHistory } from 'react-router';

export default class NewEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      groupname: '',
      selectedGroup: '',
      selectedUserListToBeSent: [],
      eventName: '',
      date: '',
      newrecipient: {},
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
      console.log(getHistory)

      // add debtHistory array and loanHistory array
      const allEvents = getHistory.debt.concat(getHistory.loaned);

      this.setState({
        myAllGroupUserData: groupStorage,
        allPastEvents: allEvents,
      });
    });
  }

  // no empty input is allowed
  blankCheck() {
    let blankCount = 0;
    let anyMemberSelected = true;
    let receipientSelectedFlag = true;
    let nextGroupStyle, nextDateStyle, nextEventNameStyle, nextNewRecipientStyle, nextCostStyle;

    if (this.state.selectedGroup === '') {
      nextGroupStyle = 'inputStyle';
      blankCount += 1;
    }
    if (this.state.date === '') {
      nextDateStyle = 'inputStyle';
      blankCount += 1;
    }
    if (!this.state.eventName.length) {
      nextEventNameStyle = 'inputStyle';
      blankCount += 1;
    }
    if (!Object.keys(this.state.newrecipient).length) {
      nextNewRecipientStyle = 'inputStyle';
      blankCount += 1;
    }
    if (!(this.state.totalCost > 0)) {
      nextCostStyle = 'inputStyle';
      blankCount += 1;
    }

    console.log('this.state.selectedUserListToBeSent::',this.state.selectedUserListToBeSent)

    const isRecipientSelected = this.state.selectedUserListToBeSent.some((member) => {
      return member.email === this.state.newrecipient.email
    });

    if(!isRecipientSelected) {
      receipientSelectedFlag = false;
    }

    // console.log('receipientSelectedCount', receipientSelectedCount)

    console.log('isRecipientSelected', isRecipientSelected);

    console.log('selectedUserListToBeSent::', this.state.selectedUserListToBeSent)
    if (this.state.selectedUserListToBeSent.length === 0) {
      anyMemberSelected = false;
    }

    this.setState({
      groupStyle: nextGroupStyle,
      dateStyle: nextDateStyle,
      eventNameStyle: nextEventNameStyle,
      recipientStyle: nextNewRecipientStyle,
      costStyle: nextCostStyle,
    });

    console.log('blankCount', blankCount, 'anyMemberSelected ::::', anyMemberSelected,'receipientSelectedFlag :::', receipientSelectedFlag )

    if (!blankCount && anyMemberSelected && receipientSelectedFlag) {
      if (!this.state.eventErrorMesseage.length) {
        this.handleSubmit();
      }
    }
    else {
      if (!receipientSelectedFlag) {
        this.setState({
          errorMesseage: '돈 낸 사람을 포함시켜주세요^^;;;',
        })
      }
      if (blankCount) {
        this.setState({
          errorMesseage: '빈칸을 모두 채워주세요 ㅠ',
        });
      }
      if (!anyMemberSelected) {
        this.setState({
          groupMemberErrorMesseage: '함께 식사한 친구들을 선택해주세요',
        });
      }
    }
  }

  // post new transaction record
  handleSubmit() {
    console.log(this.state.selectedUserListToBeSent)
    axios.post('http://localhost:3000/api/transaction', {
      date: this.state.date,
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

  selectHandleMember(event, selectedMember) {
    /*
      1. nextSelectedGroupMember: this is for RENDERING
      2. nextSelectedUserListToBeSent: this is for posting
    */

    //멤버 추가시 에러 메세지를 삭제//
    if(this.state.errorMesseage.length) {
      this.setState({
        errorMesseage: '',
      })
    }

    // 1. get members for specific group
    const nextSelectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup].map((member) => {
      return member;
    });

    // toggle selected flag when selecting member
    nextSelectedGroupMember.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;
      }
    });
    console.log('nextSelectedGroupMember', nextSelectedGroupMember)

    // 2. filter selected member and store in selecteduser list to send post later
    const nextSelectedUserListToBeSent = nextSelectedGroupMember.filter((member) => {
      return member.selected === true;
    });

    // const newSelectedUserList = Object.assign({}, nextSelectedUserListToBeSent) // don't think we need this deep copy....


    // to evaluate the number of selected members
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

    const indivCost = 100 * Math.ceil(this.state.totalCost / (count *100));

    nextSelectedUserListToBeSent.forEach((member) => {
      member.cost = indivCost;
    });

    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
    nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
      member.cost = indivCost
    });

    //

    if (this.state.groupMemberErrorMesseage.length) {
      console.log("error message exist")
      this.setState({
        selectedGroupMember: nextSelectedGroupMember,
        selectedUserListToBeSent: nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
        groupMemberErrorMesseage: '',
      });
    } else {
      console.log("error message exist")
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

      let nextNewRecipient, nextMyAllGroupUserData;
      this.state.myAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
        if (member.username === event.target.value) {
           nextNewRecipient = Object.assign({}, this.state.myAllGroupUserData[this.state.selectedGroup][index]);
           nextNewRecipient.ispaid = true;
        }
        else if (member.email === this.state.newrecipient.email) {
          nextMyAllGroupUserData = this.state.myAllGroupUserData[this.state.selectedGroup].map(member => {
            return member;
          })
          nextMyAllGroupUserData[index].ispaid = false;
        }
      });
      this.setState({
        newrecipient: nextNewRecipient,
        myAllGroupUserData: nextMyAllGroupUserData,
        recipientStyle: '',
      });
    }
  }

  // this function will check if the event already exist
  eventDuplicateCheck(event) {
    let eventDuplicateExist = false;
    return new Promise((resolve, reject) => {
      resolve(event.target)
    })
    .then((eventTarget) => {
      // console.log('event:::::', event.value)
      if (eventTarget.name === 'eventGroup') {
        console.log(eventTarget.value, this.state.eventName, this.state.date);
        return axios.get(`http://localhost:3000/api/transaction?type=check&groupname=${eventTarget.value}&eventname=${this.state.eventName}&date=${this.state.date}`)
        .then(res => {
          if(res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.name === 'eventDate') {
        console.log(this.state.selectedGroup, this.state.eventName, eventTarget.value);
        return axios.get(`http://localhost:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${this.state.eventName}&date=${eventTarget.value}`)
        .then(res => {
          console.log(res.data)
          if(res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.type === 'text') {
        console.log(this.state.selectedGroup, eventTarget.value, this.state.date);
        return axios.get(`http://localhost:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${eventTarget.value}&date=${this.state.date}`)
        .then(res => {
          console.log(res.data)
          if(res.data.length-2) {
            return true;
          }
        })
      }
    })
    .then((eventDuplicateExist) => {
      console.log("eventDuplicateExist::::::", eventDuplicateExist)
      if (eventDuplicateExist) {
        console.log('come here????')
        this.setState({
          eventErrorMesseage: '중복된 이벤트가 있습니다',
        });
      } else {
        this.setState({
          eventErrorMesseage: '',
        });
      }
    })
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
      // const newSelectedUserList = Object.assign({}, this.state.newSelectedUserList)
      const nextSelectedUserListToBeSent = [... this.state.selectedUserListToBeSent];
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

      // roundup 100 KRW
      const indivCost = 100 * Math.ceil((event.target.value / (count * 100)));

      nextSelectedUserListToBeSent.forEach((member) => {
        member.cost = indivCost;
      })

      const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
      for (let member in nextMyAllGroupUserData[this.state.selectedGroup]) {
        nextMyAllGroupUserData[this.state.selectedGroup][member].cost = indivCost;
      }

      this.setState({
        totalCost: parseInt(event.target.value),
        selectedUserListToBeSent: nextSelectedUserListToBeSent,
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
    const getGroupKeyArray = Object.keys(this.state.myAllGroupUserData);
    const groupSelection = getGroupKeyArray.map((item) => {
      return <option>{item}</option>;
    });
    // console.log("getGroupKeyArray::",getGroupKeyArray)
    // console.log("groupSelection:::", groupSelection)

    let userTable;
    // retrieve group members for specific group
    const selectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup];
    // render both selected and unselected member and apply style together
    if (Object.keys(this.state.myAllGroupUserData).length > 0
    && this.state.selectedGroup.length > 0) {
      userTable = selectedGroupMember.map((member, index) => {
        if (selectedGroupMember[index].selected) {
          return (
            <tr onClick={() => this.selectHandleMember(event, member)} className="selected">
              <td>
               {member.username} ({member.email})
            </td>
              <input
             type='number' placeholder={Math.round(this.state.myAllGroupUserData[this.state.selectedGroup][index].cost)}
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
    // render recipient drop down list
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
