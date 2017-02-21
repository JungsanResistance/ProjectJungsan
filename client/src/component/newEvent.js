import React from 'react';
import moment from 'moment';
import axios from 'axios';
import Router, { browserHistory } from 'react-router';

// http://localhost:3000/
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
      sumIndivCost: 0,
      myAllGroupUserData: {},
      selectedGroupMembers: [],
      allPastEvents: [],
      errorMesseage: '',
      groupMemberErrorMesseage: '',
      eventErrorMesseage: '',
      errorTotalMessage: '',
      totalCostErrorMessage: '',
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
    this.preCheck = this.preCheck.bind(this);
    this.eventDuplicateCheck = this.eventDuplicateCheck.bind(this);
    this.handleManualInputCost = this.handleManualInputCost.bind(this);
    this.evaluateAll = this.evaluateAll.bind(this);
    this.countSelectedMember = this.countSelectedMember.bind(this);
    this.getCurrentSelectedGroupMembers = this.getCurrentSelectedGroupMembers.bind(this);
    this.getCurrentRecipient = this.getCurrentRecipient.bind(this);
    this.getIndivCost = this.getIndivCost.bind(this);
    this.checkTotal = this.checkTotal.bind(this);
    this.addAll = this.addAll.bind(this);
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
  preCheck() {
    let errCount = 0;
    let anyMemberSelected = true;
    let receipientSelectedFlag = true;
    let memberCostCheck = true;
    let nextGroupStyle, nextDateStyle, nextEventNameStyle, nextNewRecipientStyle, nextCostStyle;
    const currentGroupMembers = this.state.myAllGroupUserData[this.state.selectedGroup];
    if (this.state.selectedGroup === '') {
      nextGroupStyle = 'inputStyle';
      errCount += 1;
    }
    if (this.state.date === '') {
      nextDateStyle = 'inputStyle';
      errCount += 1;
    }
    if (!this.state.eventName.length) {
      nextEventNameStyle = 'inputStyle';
      errCount += 1;
    }
    if (!this.state.newrecipient.selected) {
      nextNewRecipientStyle = 'inputStyle';
      errCount += 1;
    }
    if (!(this.state.totalCost > 0)) {
      nextCostStyle = 'inputStyle';
      errCount += 1;
    }
    currentGroupMembers.forEach((member) => {
      if (member.cost < 0) {
        memberCostCheck = false;
      }
    })

    const isRecipientSelected = currentGroupMembers.some((member) => {
      if (member.selected)
        return member.email === this.state.newrecipient.email
    });
    if (!isRecipientSelected) {
      receipientSelectedFlag = false;
    }

    if (currentGroupMembers.length === 0) {
      anyMemberSelected = false;
    }

    this.setState({
      groupStyle: nextGroupStyle,
      dateStyle: nextDateStyle,
      eventNameStyle: nextEventNameStyle,
      recipientStyle: nextNewRecipientStyle,
      costStyle: nextCostStyle,
    });

    const handleSubmitCondition = !errCount && anyMemberSelected
      && receipientSelectedFlag && this.checkTotal() && memberCostCheck;

    if (handleSubmitCondition) {
      if (!this.state.eventErrorMesseage.length) {
        this.handleSubmit();
      }
    }
    else {
      if (!receipientSelectedFlag) {
        this.setState({
          errorMesseage: '정산자를 포함시켜주세요',
        })
      }
      if (errCount) {
        this.setState({
          errorMesseage: '빈칸을 모두 채워주세요',
        });
      }
      if (!anyMemberSelected) {
        this.setState({
          groupMemberErrorMesseage: '함께 식사한 친구들을 선택해주세요',
        });
      }
      if (!this.checkTotal()) {
        this.setState({
          totalCostErrorMessage: '총 금액이 맞지 않습니다',
        });
      }
      if (!memberCostCheck) {
        this.setState({
          totalCostErrorMessage: '모든 금액은 양의 정수여야 합니다',
        })
      }
    }
  }

  // post new transaction record
  handleSubmit() {
    const nextSelectedGroupMember = this.getCurrentSelectedGroupMembers();
    console.log('this is the data we are sending', {
      date: this.state.date,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.selectedGroup,
      eventname: this.state.eventName,
      participants: nextSelectedGroupMember,
    })

    axios.post('http://localhost:3000/api/transaction', {
      date: this.state.date,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.selectedGroup,
      eventname: this.state.eventName,
      participants: nextSelectedGroupMember,
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
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();

    // toggle selected flag when selecting member
    nextSelectedGroupMembers.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;

        // toggle ispaid flag for the recipient
        if (this.state.newrecipient && member.email === this.state.newrecipient.email) {
          if (member.selected) {
            member.ispaid = true;
          }
          else {
            member.ispaid = false;
          }
          console.log('after toggle', member.ispaid)
        }
        if (!member.selected) {
          member.isManualCost = false;
        }
      }
    });

    // 2. filter selected member and store in selecteduser list to send post later

      // const indivCost = 100 * Math.ceil(this.state.totalCost / (count * 100));
    const indivCost = this.getIndivCost();

    if (this.countSelectedMember() > 1) {
      // when there are more than one member selected
      nextSelectedGroupMembers.forEach((member) => {
        if (member.selected && !member.isManualCost) {
          member.cost = indivCost;
        }
        else if (!member.selected) {
          member.cost = 0;
        }
      });
    }
    else {
      // when there is only one member selected
      nextSelectedGroupMembers.forEach((member) => {
        if (member.selected) {
          member.cost = this.state.totalCost;
          member.isManualCost = false;
        }
        else {
          member.cost = 0;
        }
      });
    }

    // added ispaid, cost in newrecipient
    let nextNewRecipient;
    if (this.state.newrecipient) {
      nextNewRecipient = this.getCurrentRecipient();
      nextNewRecipient.cost = indivCost;
      nextNewRecipient.ispaid = true;
    }

    if (this.state.groupMemberErrorMesseage.length) {
      this.setState({
        selectedGroupMembers: nextSelectedGroupMembers,
        groupMemberErrorMesseage: '',
        totalCostErrorMessage: '',
        newrecipient: nextNewRecipient,
      });
    } else {
      this.setState({
        selectedGroupMembers: nextSelectedGroupMembers,
        totalCostErrorMessage: '',
        newrecipient: nextNewRecipient,
      });
    }
  }

  countSelectedMember() {
    // to evaluate the number of selected members
    let count = 0;
    if (this.state.selectedGroupMembers) {
      this.state.selectedGroupMembers.forEach((member) => {
        if (member.selected) {
          count += 1;
        }
      });
    } else {
      count = 1;
    }
    return count;
  }

  getCurrentSelectedGroupMembers() {
    return Object.assign({}, this.state.myAllGroupUserData)[this.state.selectedGroup];
  }

  getCurrentRecipient() {
    return Object.assign({}, this.state.newrecipient);
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
    const nextGroupMembers = this.getCurrentSelectedGroupMembers();
    const indivCost = this.getIndivCost();
    const nextNewRecipient = this.getCurrentRecipient();

    if (this.countSelectedMember() === 0) {
      nextGroupMembers.forEach((member) => {
          member.cost = this.state.totalCost / nextGroupMembers.length;
          member.selected = true;
      });
    }
    else if (this.countSelectedMember() === 1) {
      nextGroupMembers.forEach((member) => {
        if (member.selected) {
          member.cost = this.state.totalCost;
          member.isManualCost = false;
          if (!this.checkTotal()) {
            member.selected = false;
          }
        }
      });
    }
    else {
      nextGroupMembers.forEach((member) => {
        if (member.selected && !member.isManualCost) {
          member.cost = indivCost;
        }
        else if (!member.selected) {
          member.cost = 0;
        }
      });
      nextNewRecipient.cost = indivCost;
    }

    let nextTotalCostErrorMessage = '';
    if (this.checkTotal()) {
      nextTotalCostErrorMessage = ''
    }
    else {
      nextTotalCostErrorMessage = '총 금액이 맞지 않습니다'
    }

    this.setState({
      selectedGroupMembers: nextGroupMembers,
      totalCostErrorMessage: nextTotalCostErrorMessage,
      newrecipient: nextNewRecipient,
    });
  }

  addAll() {
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
    const sum = nextSelectedGroupMembers.reduce((total, member) => {
      return total + member.cost;
    }, 0);
    this.setState({
      sumIndivCost: sum,
    });
  }

  checkTotal() {
    const total = this.state.totalCost;
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
    const sumMemberCost = nextSelectedGroupMembers.reduce((total, member) => {
      return total + member.cost;
    }, 0);


    const highEndDeviation = total + 100;
    const lowEndDeviation = total - 100;
    console.log('highEnd', highEndDeviation, 'lowEnd', lowEndDeviation, 'sumMemberCost', sumMemberCost);
    if (sumMemberCost < highEndDeviation && sumMemberCost > lowEndDeviation) {
      return true;
    }
    else {
      return false;
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
          groupStyle: '',
          newrecipient: {},
        });
      }
      else if (event.target.value) {
        const nextSelectedGroupMembers = Object.assign({}, this.state.myAllGroupUserData)[event.target.value];
        this.setState({
          selectedGroup: event.target.value,
          selectedGroupMembers: nextSelectedGroupMembers,
          groupStyle: '',
          newrecipient: {},
        });
      }
    }

    else if (event.target.name === 'recipientList') {
      const selectedRecipientName = event.target.value;
      console.log('selected recipient name', selectedRecipientName)
      if (event.target.value === "select the recipient") {
        this.setState({
          newrecipient: {},
          groupMemberErrorMesseage: '',
        });
      }

      let nextNewRecipient;
      const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
      const indivCost = this.getIndivCost();
      nextSelectedGroupMembers.forEach((member, index) => {
        if (member.username === selectedRecipientName) {
         nextNewRecipient = Object.assign({}, nextSelectedGroupMembers[index]);
         nextNewRecipient.ispaid = true;
         nextNewRecipient.selected = true;
         nextNewRecipient.cost = indivCost;
         member.ispaid = true;
        }
        // set past recipient's ispaid flag down
        else if (member.email === this.state.newrecipient.email) {
          nextSelectedGroupMembers[index].ispaid = false;
        }
      });
      this.setState({
        oldrecipient: nextNewRecipient,
        newrecipient: nextNewRecipient,
        // myAllGroupUserData: nextMyAllGroupUserData,
        selectedGroupMembers: nextSelectedGroupMembers,
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
      // const indivCost = 100 * Math.ceil((event.target.value / (count * 100)));
      const indivCost = this.getIndivCost();
      const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();

      nextSelectedGroupMembers.forEach((member) => {
        if (member.selected && !member.isManualCost) {
          member.cost = indivCost;
        }
        else {
          console.log('member not selected')
        }
      })

      this.setState({
        totalCost: parseInt(event.target.value),
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


  handleManualInputCost(event, costIndex) {
    const manualInputCost = parseInt(event.target.value);

    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
    // const indivCost = 100 * Math.ceil(((this.state.totalCost - sumAllManualCost) / ((length - isManualCostCount) * 100)));

    if (event.target.value.length) {
      nextSelectedGroupMembers[costIndex].isManualCost = true;
      nextSelectedGroupMembers[costIndex].cost = manualInputCost;
    }
    else {
      nextSelectedGroupMembers[costIndex].isManualCost = false;
      nextSelectedGroupMembers[costIndex].cost = 0;
      nextSelectedGroupMembers[costIndex].selected = false;
    }

    this.setState({
      selectedGroupMembers: nextSelectedGroupMembers,
      // errorTotalMessage: errorTotalMessage,
    });

  }

  render() {
    console.log('all group data', this.state.myAllGroupUserData);
    console.log('selected Group Members', this.state.selectedGroupMembers);
    console.log('selected group name', this.state.selectedGroup)
    console.log('this.state.newrecipient', this.state.newrecipient)
    // get all group Key as array
    const getGroupKeyArray = Object.keys(this.state.myAllGroupUserData);
    const groupSelection = getGroupKeyArray.map((group) => {
      return <option>{group}</option>;
    });


    let userTable;
    // retrieve group members for specific group
    const selectedGroupMembers = this.state.selectedGroupMembers;

    // render both selected and unselected member and apply style together
    const hasMyAllGroupUserData = Object.keys(this.state.myAllGroupUserData).length > 0;
    const isAnyGroupSelected = this.state.selectedGroup.length > 0;

    if (hasMyAllGroupUserData && isAnyGroupSelected) {
      userTable = selectedGroupMembers.map((member, index) => {
        if (selectedGroupMembers[index].selected) {
          return (
              <tr>
                <td onClick={event => this.selectHandleMember(event, member)} className="selected">
                 {member.username} ({member.email})
                </td>
                <input
               type='number' placeholder={this.state.myAllGroupUserData[this.state.selectedGroup][index].cost}
                    onChange={(event) => this.handleManualInputCost(event, index)}/>
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
    if (selectedGroupMembers.length) {
      recipientTable = selectedGroupMembers.map((member) => {
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
            <tr>
              <td className="showTotalCost">
               모두 더하면
              </td>
              {this.state.sumIndivCost} KRW
            </tr>
          </table>
        <br />
        <br />
        <input type="button" className="Nbbang" value="자동N빵!" onClick={this.evaluateAll} />
        <input type="button" className="addAll" value="금액더하기" onClick={this.addAll} />
        <p>{this.state.totalCostErrorMessage}</p>
        <br />
        <br />
        {this.state.groupMemberErrorMesseage}
        <br />
        <input type="button" className="inputData" value="이벤트 등록" onClick={this.preCheck} />
        <br />
        <br />
        {this.state.errorMesseage}
      </div>
    );
  }
}
