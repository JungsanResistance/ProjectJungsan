import React from 'react';
import Router, { browserHistory } from 'react-router';
import moment from 'moment';
import axios from 'axios';

//정산자가 선택되지 않았을 시 에러 메세지가 필요//

export default class EditEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      currentgroupname: '',
      oldeventName: '',
      newEventName: '',
      oldDate: '',
      newDate: '',
      oldrecipient: {},
      newrecipient: {},
      currentGroupMembers: [],

      totalCost: 0,
      sumIndivCost: 0,

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
    this.selectHandleRecipient = this.selectHandleRecipient.bind(this);
    this.inputHandleChange = this.inputHandleChange.bind(this);
    this.selectHandleMember = this.selectHandleMember.bind(this);
    this.preCheck = this.preCheck.bind(this);
    this.eventDuplicateCheck = this.eventDuplicateCheck.bind(this);
    this.handleManualInputCost = this.handleManualInputCost.bind(this);
    this.evaluateAll = this.evaluateAll.bind(this);
    this.countSelectedMember = this.countSelectedMember.bind(this);
    this.getCurrentGroupMembers = this.getCurrentGroupMembers.bind(this);
    this.getCurrentRecipient = this.getCurrentRecipient.bind(this);
    this.updateRecipientInfo = this.updateRecipientInfo.bind(this);
    this.getIndivCost = this.getIndivCost.bind(this);
    this.checkTotal = this.checkTotal.bind(this);
    this.addAll = this.addAll.bind(this);
    this.updateIndivCostDisplay = this.updateIndivCostDisplay.bind(this);
  }

  componentWillMount() {
    const selectedEventData = JSON.parse(this.props.params.eventInfo);
    const getGroupData = axios.get('https://oneovern.com/api/transaction?type=post');
    const getEventData = axios.get(
      `https://oneovern.com/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`);

    Promise.all([getGroupData, getEventData])
    .then((res) => {

      const groupData = JSON.parse(res[0].data);
      const eventData = JSON.parse(res[1].data);
      console.log(groupData, eventData);

      const totalCost = eventData.participants.reduce((total, member) => {
        return total + member.cost;
      }, 0);

      const storage = [];
      const currentGroupMembers = groupData.filter((member) => {
        return member.groupname === eventData.groupname;
      });

      // first let us prepare the group member storage with the format we would use
      currentGroupMembers.forEach((member) => {
        storage.push({
          username: member.username,
          email: member.email,
          selected: false,
          cost: 0,
          ispaid: 0,
          isManualCost: false,
        });
      });

      // second, let us reflect the past member property to our storage
      const oldParticipants = eventData.participants;
      oldParticipants.forEach((participant) => {
        storage.forEach((member) => {
          if (member.email === participant.email) {
            member.selected = true;
            member.cost = participant.cost;
          }
          if (member.email === eventData.oldrecipient.email) {
            member.ispaid = 1;
          }
        });
      });

      console.log(storage);

      this.setState({
        currentgroupname: eventData.groupname,
        oldEventName: eventData.eventname,
        newEventName: eventData.eventname,
        oldDate: eventData.date,
        newDate: eventData.date,
        newrecipient: eventData.newrecipient,
        oldrecipient: eventData.newrecipient,
        oldParticipants: eventData.participants,
        totalCost: totalCost,
        currentGroupMembers: storage,
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
    const currentGroupMembers = this.getCurrentGroupMembers();

    if (this.state.newdate === '') {
      nextDateStyle = 'inputStyle';
      errCount += 1;
    }
    if (!this.state.newEventName.length) {
      nextEventNameStyle = 'inputStyle';
      errCount += 1;
    }
    if (!this.state.newrecipient) {
      console.log('error recipient!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', this.state.newrecipient)
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
    });

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
    const nextSelectedGroupMembers = this.getCurrentGroupMembers();
    const filterParticipants = nextSelectedGroupMembers.filter((member) => {
      return member.selected;
    });

    const storage = [];
    filterParticipants.forEach((member) => {
      storage.push({
        username: member.username,
        email: member.email,
        cost: member.cost,
        ispaid: member.ispaid,
      })
    })

    console.log('this is the data we are sending', {
      olddate: this.state.oldDate,
      newdate: this.state.newDate,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.currentgroupname,
      oldeventname: this.state.oldEventName,
      neweventname: this.state.newEventName,
      participants: storage,
    });

    axios.put('https://oneovern.com/api/transaction', {
      olddate: this.state.oldDate,
      newdate: this.state.newDate,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.currentgroupname,
      oldeventname: this.state.oldEventName,
      neweventname: this.state.newEventName,
      participants: storage,
    })
    .then((res) => {
      if (res.status === 200) {
        alert('이벤트가 등록되었습니다.');
        browserHistory.push('/mypage');
      }
      else if (res.status === 401){
        alert('수정 권한이 없습니다');
        console.log('put response:', res);
      }
      else {
        alert('시스템 오류')
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
    const nextSelectedGroupMembers = this.getCurrentGroupMembers();

    // toggle selected flag when selecting member
    nextSelectedGroupMembers.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;

        // toggle ispaid flag for the recipient
        if (this.state.newrecipient && member.email === this.state.newrecipient.email) {
          if (member.selected) {
            member.ispaid = 1;
          }
          else {
            member.ispaid = 0;
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
    else if (this.countSelectedMember() === 1){
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
    else {
      // no member is selected
      nextSelectedGroupMembers.forEach((member) => {
        member.cost = 0;
        member.isManualCost = false;
      });
    }

    if (this.state.groupMemberErrorMesseage.length) {
      this.setState({
        currentGroupMembers: nextSelectedGroupMembers,
        groupMemberErrorMesseage: '',
        totalCostErrorMessage: '',
      }, () => {
        this.addAll();
        this.updateRecipientInfo();
      });
    } else {
      this.setState({
        currentGroupMembers: nextSelectedGroupMembers,
        totalCostErrorMessage: '',
      }, () => {
        this.addAll();
        this.updateRecipientInfo();
      });
    }
  }

  countSelectedMember() {
    // to evaluate the number of selected members
    let count = 0;
    if (this.state.currentGroupMembers) {
      this.state.currentGroupMembers.forEach((member) => {
        if (member.selected) {
          count += 1;
        }
      });
    } else {
      count = 1;
    }
    return count;
  }

  getCurrentGroupMembers() {
    return this.state.currentGroupMembers.map((member) => {
      return member;
    })
  }

  getCurrentRecipient() {
    return Object.assign({}, this.state.newrecipient);
  }

  getIndivCost() {
    let sumAllManualCost = 0;
    let isManualCostCount = 0;
    let memberIndexHasManualCost;

    this.state.currentGroupMembers.forEach((member, index) => {
      if (member.isManualCost) {
        sumAllManualCost += member.cost;
        isManualCostCount += 1;
        memberIndexHasManualCost = index;
      }
    });

    // this calculation is unsure
    // const indivCost = 100 * Math.ceil(((this.state.totalCost - sumAllManualCost) / ((length - isManualCostCount) * 100)));
    const count = this.countSelectedMember();
    const indivCost = count - isManualCostCount ? (this.state.totalCost - sumAllManualCost) / (count - isManualCostCount) : this.state.selectedGroupMembers[memberIndexHasManualCost];
    return indivCost;
  }

  evaluateAll() {
    const nextGroupMembers = this.getCurrentGroupMembers();
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
      currentGroupMembers: nextGroupMembers,
      totalCostErrorMessage: nextTotalCostErrorMessage,
      newrecipient: nextNewRecipient,
    }, () => {
      this.addAll();
      this.updateRecipientInfo();
      this.updateIndivCostDisplay();
    });
  }

  addAll() {
    const nextSelectedGroupMembers = this.getCurrentGroupMembers();
    const sum = nextSelectedGroupMembers.reduce((total, member) => {
      return total + member.cost;
    }, 0);
    this.setState({
      sumIndivCost: sum,
    });
  }

  updateIndivCostDisplay() {
    // here we update each member cost
    const indivCost = this.getIndivCost();
    const nextSelectedGroupMembers = this.getCurrentGroupMembers();

    nextSelectedGroupMembers.forEach((member) => {
      if (member.selected && !member.isManualCost) {
        member.cost = indivCost;
      }
      else {
        console.log('member not selected')
      }
    });

    console.log('next members after update', nextSelectedGroupMembers)
    this.setState({
      currentGroupMembers: nextSelectedGroupMembers,
    });
  }

  checkTotal() {
    const total = this.state.totalCost;
    const nextSelectedGroupMembers = this.getCurrentGroupMembers();
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

  // select recipient
  selectHandleRecipient(event) {
    if (this.state.errorMesseage.length) {
      this.setState({
        errorMesseage: '',
      });
    }

    const selectedRecipientName = event.target.value;
    console.log('selected recipient name', selectedRecipientName)

    if (selectedRecipientName === "select the recipient") {
      this.setState({
        newrecipient: {},
        groupMemberErrorMesseage: '',
      });
    }
    else {
      let nextNewRecipient;
      const nextSelectedGroupMembers = this.getCurrentGroupMembers();
      const indivCost = this.getIndivCost();
      nextSelectedGroupMembers.forEach((member, index) => {
        if (member.username === selectedRecipientName) {
         nextNewRecipient = Object.assign({}, nextSelectedGroupMembers[index]);
         delete nextNewRecipient.isManualCost;
         delete nextNewRecipient.selected;
         console.log(nextNewRecipient)
         nextNewRecipient.ispaid = 1;
        //  nextNewRecipient.selected = true;
         nextNewRecipient.cost = indivCost;
         member.ispaid = 1;
        }
        // set past recipient's ispaid flag down
        else if (member.email === this.state.newrecipient.email && member.name !== selectedRecipientName) {
          nextSelectedGroupMembers[index].ispaid = 0;
        }
      });
      console.log('nextNewREcipient', nextNewRecipient);

      this.setState({
        newrecipient: nextNewRecipient,
        currentGroupMembers: nextSelectedGroupMembers,
        recipientStyle: '',
      });
    }
  }

  updateRecipientInfo() {
    const indivCost = this.getIndivCost();
    const nextNewRecipient = this.getCurrentRecipient();
    const nextSelectedGroupMembers = this.state.currentGroupMembers;

    nextSelectedGroupMembers.forEach((member) => {
      if (member.email === nextNewRecipient.email) {
        if (member.selected) {
          nextNewRecipient.ispaid = 1;
          if (member.isManualCost) {
            nextNewRecipient.cost = member.cost;
          }
          else {
            nextNewRecipient.cost = indivCost;
          }
        }
        else {
          nextNewRecipient.cost = 0;
          nextNewRecipient.ispaid = 0;
        }
      }
    });

    this.setState({
      newrecipient: nextNewRecipient,
    });
  }

  // this function will check if the event already exist
  eventDuplicateCheck(event) {
    let eventDuplicateExist = false;
    return new Promise((resolve, reject) => {
      resolve(event.target)
    })
    .then((eventTarget) => {
      if (eventTarget.name === 'eventGroup') {
        return axios.get(`https://oneovern.com/api/transaction?type=check&groupname=${eventTarget.value}&eventname=${this.state.eventName}&date=${this.state.date}`)

        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.name === 'eventDate') {
        return axios.get(`https://oneovern.com/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${this.state.eventName}&date=${eventTarget.value}`)

        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.type === 'text') {
        return axios.get(`https://oneovern.com/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${eventTarget.value}&date=${this.state.date}`)

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
        newdate: event.target.value,
        dateStyle: '',
      });
    }

    else if (event.target.type === 'number') {
      // const indivCost = 100 * Math.ceil((event.target.value / (count * 100)));
      const indivCost = this.getIndivCost();
      const nextSelectedGroupMembers = this.getCurrentGroupMembers();

      nextSelectedGroupMembers.forEach((member) => {
        if (member.selected && !member.isManualCost) {
          member.cost = indivCost;
        }
        else {
          console.log('member not selected')
        }
      });

      this.setState({
        totalCost: parseInt(event.target.value),
        costStyle: '',
        // indivCost: indivCost,
      }, () => {
        this.addAll();
        this.updateIndivCostDisplay();
        this.updateRecipientInfo();
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

    const nextSelectedGroupMembers = this.getCurrentGroupMembers();
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
      currentGroupMembers: nextSelectedGroupMembers,
      // errorTotalMessage: errorTotalMessage,
    }, () => {
      this.addAll();
      this.updateIndivCostDisplay();
      this.updateRecipientInfo();
    });

  }

  render() {
    console.log(this.state)
    console.log('selected group name', this.state.currentGroupMembers)
    console.log('this.state.newrecipient', this.state.newrecipient)


    let userTable;
    // retrieve group members for specific group
    const currentGroupMembers = this.state.currentGroupMembers;
    const pastTotalCost = currentGroupMembers.reduce((total, member) => {
      return total + member.cost;
    }, 0);

    // render both selected and unselected member and apply style together
    if (currentGroupMembers.length) {
        userTable = currentGroupMembers.map((member, index) => {
          if (currentGroupMembers[index].selected) {
            return (
                <tr>
                  <td onClick={event => this.selectHandleMember(event, member)} className="selected">
                   {member.username} ({member.email})
                  </td>
                  <input
                 type='number' placeholder={currentGroupMembers[index].cost}
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
    // if (currentGroupMembers.length) {
      recipientTable = currentGroupMembers.map((member) => {
        if (member.email !== this.state.newrecipient.email) {
          return <option>{member.username}</option>;
        }
      });
    // }
    // else {
    //   recipientTable = [];
    // }

    return (
      <div>
        <p>
          그룹 이름: {this.state.currentgroupname}
        </p>
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
            onChange={this.selectHandleRecipient}>
            <option>{this.state.newrecipient.username}</option>
            {recipientTable}
          </select>
          <p>
            총액 :
            <input
              name="eventCost" className={this.state.costStyle} type="number"
              placeholder={pastTotalCost} onChange={this.inputHandleChange} />
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
