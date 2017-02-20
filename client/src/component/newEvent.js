import React from 'react';
import moment from 'moment';
import axios from 'axios';
import Router, { browserHistory } from 'react-router';

// http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/
// http://localhost:3000/

export default class NewEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      groupname: '',
      selectedGroup: '',
      eventName: '',
      date: '',
      oldrecipient: {},
      newrecipient: {},
      totalCost: 0,
      // indivCost: 0,
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
    this.handleCustomInputCost = this.handleCustomInputCost.bind(this);
    this.evaluateAll = this.evaluateAll.bind(this);
    this.countSelectedMember = this.countSelectedMember.bind(this);
    this.getIndivCost = this.getIndivCost.bind(this);
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
          isManualCost: false,
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

    const isRecipientSelected = this.state.myAllGroupUserData[this.state.selectedGroup].some((member) => {
      return member.email === this.state.newrecipient.email
    });

    if (!isRecipientSelected) {
      receipientSelectedFlag = false;
    }

    if (this.state.myAllGroupUserData[this.state.selectedGroup].length === 0) {
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
    const nextmyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
    const nextParticipants = nextmyAllGroupUserData[this.state.selectedGroup].filter((participant) => {
      return participant.selected === true;
    });

    console.log({
      date: this.state.date,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.selectedGroup,
      eventname: this.state.eventName,
      participants: nextParticipants,
    })

    axios.post('http://localhost:3000/api/transaction', {
      date: this.state.date,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.selectedGroup,
      eventname: this.state.eventName,
      participants: nextParticipants,
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
        // toggle ispaid flag for the recipient
        if (member.email === this.state.newrecipient.email) {
          member.ispaid = !member.ispaid;
        }
        if (!member.selected) {
          member.isManualCost = false;
        }
      }
    });

    // 2. filter selected member and store in selecteduser list to send post later
    // here the lenth of array is generally reduced unless all members are selected
    const nextSelectedUserListToBeSent = nextSelectedGroupMember.filter((member) => {
      return member.selected === true;
    });

      // const indivCost = 100 * Math.ceil(this.state.totalCost / (count * 100));
    const indivCost = this.getIndivCost();

    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);

    if (this.countSelectedMember() > 1) {
      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
        if (member.selected && !member.isManualCost) {
          member.cost = indivCost;
        }
      });
    }
    else {
      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
        if (member.selected) {
          member.cost = this.state.totalCost;
          member.isManualCost = false;
        }
      });
    }

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
        myAllGroupUserData: nextMyAllGroupUserData,
        groupMemberErrorMesseage: '',
        indivCost: indivCost,
        newrecipient: nextNewRecipient,
      });
    } else {
      this.setState({
        selectedGroupMember: nextSelectedGroupMember,
        myAllGroupUserData: nextMyAllGroupUserData,
        indivCost: indivCost,
        newrecipient: nextNewRecipient,
      });
    }
  }

  countSelectedMember() {
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
    return count;
  }

  getIndivCost() {
    let sumAllManualCost = 0;
    let isManualCostCount = 0;

    this.state.myAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
      if (member.isManualCost) {
        sumAllManualCost += member.cost;
        console.log(member, sumAllManualCost)
        isManualCostCount += 1;
      }
    });

    // this calculation is unsure
    // const indivCost = 100 * Math.ceil(((this.state.totalCost - sumAllManualCost) / ((length - isManualCostCount) * 100)));
    const count = this.countSelectedMember();
    const indivCost = (this.state.totalCost - sumAllManualCost) / (count - isManualCostCount);
    return indivCost;
  }

  evaluateAll() {
    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
    const indivCost = this.getIndivCost();

    if (this.countSelectedMember() === 0) {
      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
          member.cost = this.state.totalCost / nextMyAllGroupUserData[this.state.selectedGroup].length;
          member.selected = true;
      });
    }
    else if (this.countSelectedMember() === 1) {
      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
        if (member.selected) {
          member.cost = this.state.totalCost;
          member.isManualCost = false;
          member.selected = false;
        }
      });
    }
    else {
      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member) => {
        if (!member.isManualCost) {
          member.cost = indivCost;
        }
      });
    }

    this.setState({
      myAllGroupUserData: nextMyAllGroupUserData,
    });
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

      nextMyAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
        if (member.username === selectedRecipientName) {
         nextNewRecipient = Object.assign({}, this.state.myAllGroupUserData[this.state.selectedGroup][index]);
         nextNewRecipient.ispaid = true;
         nextNewRecipient.selected = true;
         nextNewRecipient.cost = this.state.indivCost;
         member.ispaid = true;
        }
        // if the member is the previous selected recipient, set ispaid flag down
        else if (member.email === this.state.newrecipient.email) {
          nextMyAllGroupUserData[this.state.selectedGroup][index].ispaid = false;
        }
      });
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
        return axios.get(`http://localhost:3000/api/transaction?type=check&groupname=${eventTarget.value}&eventname=${this.state.eventName}&date=${this.state.date}`)
        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.name === 'eventDate') {
        return axios.get(`http://localhost:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${this.state.eventName}&date=${eventTarget.value}`)
        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.type === 'text') {
        return axios.get(`http://localhost:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${eventTarget.value}&date=${this.state.date}`)
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
      // roundup 100 KRW
      // const indivCost = 100 * Math.ceil((event.target.value / (count * 100)));
      // const indivCost = event.target.value / count;
      const indivCost = this.getIndivCost();

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


  handleCustomInputCost(event, costIndex) {
    const manualInputCost = parseInt(event.target.value);

    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData);
    // const indivCost = 100 * Math.ceil(((this.state.totalCost - sumAllManualCost) / ((length - isManualCostCount) * 100)));

    if (event.target.value.length) {
      nextMyAllGroupUserData[this.state.selectedGroup][costIndex].isManualCost = true;
      nextMyAllGroupUserData[this.state.selectedGroup][costIndex].cost = manualInputCost;
    }
    else {
      const indivCost = this.getIndivCost();
      nextMyAllGroupUserData[this.state.selectedGroup][costIndex].isManualCost = false;
      nextMyAllGroupUserData[this.state.selectedGroup][costIndex].cost = 0;
      nextMyAllGroupUserData[this.state.selectedGroup][costIndex].selected = false;
    }


    // sumAllManualCost = manualInputCost + sumAllManualCost;
    // // console.log('event.target.value', event.target.value, 'sumAllManualCost', sumAllManualCost, 'manualInputCost', manualInputCost)
    // const lowEndCost = this.state.totalCost - 100;
    // const highEndCost = this.state.totalCost + 100;
    // const checkTotal = lowEndCost < sumAllManualCost && sumAllManualCost < highEndCost;

    // let errorTotalMessage = '';
    // if (!checkTotal) {
    //   console.log('total cost is wrong')
    //   errorTotalMessage = '총 금액을 확인해 주세요';
    // }

    this.setState({
      myAllGroupUserData: nextMyAllGroupUserData,
      // errorTotalMessage: errorTotalMessage,
      // indivCost: indivCost,
    });


  }


  render() {
    console.log('render the group member!!', this.state.myAllGroupUserData[this.state.selectedGroup]);
    console.log('the current indivCost', this.state.indivCost)
    // get all group Key as array
    const getGroupKeyArray = Object.keys(this.state.myAllGroupUserData);
    const groupSelection = getGroupKeyArray.map((group) => {
      return <option>{group}</option>;
    });


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
                    onChange={(event) => this.handleCustomInputCost(event, index)}/>
              </tr>);
          } else {
            return (
              <tr>
                <td onClick={(event) => this.selectHandleMember(event, member)} className="unselected">
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
              type="text" className={this.state.eventNameStyle} placeholder="어디서?"
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
          <input type="button" className="Bang" value="계산 쾅!" onClick={this.evaluateAll} />
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
