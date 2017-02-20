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
      oldrecipient: {},
      newrecipient: {},
      totalCost: 0,
      indivCost: 0,
      myAllGroupUserData: {},
      allPastEvents: [],
      errorMesseage: '',
      groupMemberErrorMesseage: '',
      eventErrorMesseage: '',
      errorTotalMessage: '',

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
    // this.handleCustomInputCost = this.handleCustomInputCost.bind(this);
  }
  componentWillMount() {
    const getGroupData = axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=post');
    const getAllEvents = axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/history');
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

    const isRecipientSelected = this.state.selectedUserListToBeSent.some((member) => {
      return member.email === this.state.newrecipient.email
    });

    if (!isRecipientSelected) {
      receipientSelectedFlag = false;
    }

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

      console.log({
        date: this.state.date,
        oldrecipient: this.state.oldrecipient,
        newrecipient: this.state.newrecipient,
        groupname: this.state.selectedGroup,
        eventname: this.state.eventName,
        participants: this.state.selectedUserListToBeSent,
      })
    axios.post('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction', {
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

  // select & unselect memeber here
  selectHandleMember(event, selectedMember) {
    /*
      1. nextSelectedGroupMember: this is for RENDERING
      2. nextSelectedUserListToBeSent: this is for axios posting
    */

    // 멤버 추가시 에러 메세지를 삭제//
    if (this.state.errorMesseage.length) {
      this.setState({
        errorMesseage: '',
      });
    }

    // 1. get members for specific group (deep copy)
    const nextSelectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup].map((member) => {
      return member;
    });

    // toggle selected flag when selecting member
    nextSelectedGroupMember.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;
        member.ispaid = !member.ispaid;
      }
    });

    // 2. filter selected member and store in selecteduser list to send post later
    // here the lenth of array is generally reduced unless all members are selected
    const nextSelectedUserListToBeSent = nextSelectedGroupMember.filter((member) => {
      return member.selected === true;
    });

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
    const indivCost = 100 * Math.ceil(this.state.totalCost / (count * 100));

    nextSelectedUserListToBeSent.forEach((member) => {
      member.cost = indivCost;
    });

    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
    nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
      if (member.selected) {
        member.cost = indivCost
      }
    });


    // added isspaid, cost in newrecipient
    let nextNewRecipient;
    if (this.state.newrecipient) {
      nextNewRecipient = Object.assign({}, this.state.newrecipient);
      nextNewRecipient.cost = indivCost;
      nextNewRecipient.ispaid = true;
    }

    if (this.state.groupMemberErrorMesseage.length) {
      this.setState({
        selectedGroupMember: nextSelectedGroupMember,
        selectedUserListToBeSent: nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
        groupMemberErrorMesseage: '',
        indivCost: indivCost,
        newrecipient: nextNewRecipient,
      });
    } else {
      this.setState({
        selectedGroupMember: nextSelectedGroupMember,
        selectedUserListToBeSent: nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
        indivCost: indivCost,
        newrecipient: nextNewRecipient,
      });
    }
  }

  // select group & recipient
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
          newrecipient: {},
        });
      }
      else if (event.target.value) {
        this.setState({
          selectedGroup: event.target.value,
          groupStyle: '',
          newrecipient: {},
        });
      }
    }

    else if (event.target.name === 'recipientList') {
      const selectedRecipientName = event.target.value;
      if (event.target.value === "select the recipient") {
        this.setState({
          newrecipient: {},
          groupMemberErrorMesseage: '',
        });
      }

      let nextNewRecipient;
      const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);

      // if (Object.keys(this.state.newrecipient).length) {
      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
        if (member.username === selectedRecipientName) {
         nextNewRecipient = Object.assign({}, this.state.myAllGroupUserData[this.state.selectedGroup][index]);
         nextNewRecipient.ispaid = true;
         nextNewRecipient.selected = true;
         nextNewRecipient.cost = this.state.indivCost;
        }
        // if the member is the previous selected recipient, set ispaid flag down
        else if (member.email === this.state.newrecipient.email) {
          nextMyAllGroupUserData[this.state.selectedGroup][index].ispaid = false;
        }
      });
      // }
      this.setState({
        oldrecipient: nextNewRecipient,
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
      if (eventTarget.name === 'eventGroup') {
        return axios.get(`http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=check&groupname=${eventTarget.value}&eventname=${this.state.eventName}&date=${this.state.date}`)
        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.name === 'eventDate') {
        return axios.get(`http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${this.state.eventName}&date=${eventTarget.value}`)
        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.type === 'text') {
        return axios.get(`http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${eventTarget.value}&date=${this.state.date}`)
        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
    })
    .then((eventDuplicateExist) => {
      if (eventDuplicateExist) {
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

    // clean error message
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
      const nextSelectedUserListToBeSent = this.state.selectedUserListToBeSent.map((member) => {
        return member;
      })
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
      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
        if (member.selected) {
          member.cost = indivCost;
        }
        else {
          console.log('member not selected')
        }
      })

      this.setState({
        totalCost: parseInt(event.target.value),
        selectedUserListToBeSent: nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
        costStyle: '',
        indivCost: indivCost,
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
  /*
  handleCustomInputCost(event, costIndex) {
    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
    const thisGroupMembers = nextMyAllGroupUserData[this.state.selectedGroup];
    const customCost = parseInt(event.target.value);
    const nextSelectedUserListToBeSent = this.state.selectedUserListToBeSent.map((member) => {
      return member;
    });

    let otherSumCost = 0;
    let userCostCount = 0;
    console.log('thisGroupMembers', thisGroupMembers)
    thisGroupMembers.forEach((member) => {
      if (member.usercost) {
        otherSumCost += member.cost;
        userCostCount += 1;
      }
    })
    const sumCustomCost = customCost + otherSumCost;
    console.log('otherSumCost', otherSumCost, 'customCost', customCost)
    thisGroupMembers[costIndex].usercost = true;
    thisGroupMembers[costIndex].cost = customCost;
    const length = nextSelectedUserListToBeSent.length;

    //this calculation is wrong
    const indivCost = 100 * Math.ceil(((this.state.totalCost - sumCustomCost) / ((length - userCostCount) * 100)));
    nextMyAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
      if (index !== costIndex && member.selected) {
        nextMyAllGroupUserData[this.state.selectedGroup][index].cost = indivCost;
      }
      else {
        // console.log(member, index)
      }
    });

    const lowEndCost = this.state.totalCost - 1000;
    const highEndCost = this.state.totalCost + 1000;
    const checkTotal = lowEndCost < sumCustomCost && sumCustomCost < highEndCost;

    console.log('checkTotal', checkTotal, 'totalcost', this.state.totalCost, 'sumCustomCost', sumCustomCost, 'lowEndCost', lowEndCost,
     'highEndCost', highEndCost, 'selected member length', length, 'userCostCount', userCostCount)

    let errorTotalMessage = '';
    if (!checkTotal) {
      console.log('total cost is wrong')
      errorTotalMessage = '총 금액을 확인해 주세요';
    }
    this.setState({
      myAllGroupUserData: nextMyAllGroupUserData,
      errorTotalMessage: errorTotalMessage,
    });
  }
  */

  render() {
    console.log(this.state.myAllGroupUserData);
    console.log('the current indivCost', this.state.indivCost)
    // get all group Key as array
    const getGroupKeyArray = Object.keys(this.state.myAllGroupUserData);
    const groupSelection = getGroupKeyArray.map((group) => {
      return <option>{group}</option>;
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
              <tr>
                <td onClick={event => this.selectHandleMember(event, member)} className="selected">
                 {member.username} ({member.email})
              </td>
                <input
               type='number' placeholder={this.state.myAllGroupUserData[this.state.selectedGroup][index].cost}
                  onChange={() => this.handleCustomInputCost(event, index)}/>
              </tr>);
          } else {
            return (
              <tr>
                <td onClick={() => this.selectHandleMember(event, member)} className="unselected">
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
