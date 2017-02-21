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
      oldRecipient: {},
      newRecipient: {},
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
    this.getIndivCost = this.getIndivCost.bind(this);
    this.checkTotal = this.checkTotal.bind(this);
    this.addAll = this.addAll.bind(this);
  }

  componentWillMount() {
    const selectedEventData = JSON.parse(this.props.params.eventInfo);
    const getGroupData = axios.get('http://localhost:3000/api/transaction?type=post');
    const getEventData = axios.get(
      `http://localhost:3000/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`);

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
          email: member.email,
          username: member.username,
          selected: false,
          cost: 0,
          ispaid: false,
          isManualCost: false,
        });
      });

      // second, let us reflect the past member property to our storage
      const oldParticipants = eventData.participants;
      console.log(oldParticipants)
      oldParticipants.forEach((participant) => {
        storage.forEach((member) => {
          if (member.email === participant.email) {
            member.selected = true;
            member.cost = participant.cost;
          }
          if (member.email === eventData.oldrecipient.email) {
            member.ispaid = true;
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
        newRecipient: eventData.newrecipient,
        oldRecipient: eventData.newrecipient,
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
    if (!this.state.newRecipient) {
      console.log('error recipient!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', this.state.newRecipient)
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
        return member.email === this.state.newRecipient.email
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
      oldrecipient: this.state.oldRecipient,
      newrecipient: this.state.newRecipient,
      groupname: this.state.currentgroupname,
      oldeventname: this.state.oldEventName,
      neweventname: this.state.newEventName,
      participants: storage,
    });

    axios.post('http://localhost:3000/api/transaction', {
      olddate: this.state.oldDate,
      newdate: this.state.newDate,
      oldrecipient: this.state.oldRecipient,
      newrecipient: this.state.newRecipient,
      groupname: this.state.currentgroupname,
      oldeventname: this.state.oldEventName,
      neweventname: this.state.newEventName,
      participants: storage,
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
    const nextSelectedGroupMembers = this.getCurrentGroupMembers();

    // toggle selected flag when selecting member
    nextSelectedGroupMembers.forEach((member) => {
      if (member.email === selectedMember.email) {
        member.selected = !member.selected;

        // toggle ispaid flag for the recipient
        if (this.state.newRecipient && member.email === this.state.newRecipient.email) {
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
    if (this.state.newRecipient) {
      nextNewRecipient = this.getCurrentRecipient();
      nextNewRecipient.cost = indivCost;
      nextNewRecipient.ispaid = true;
    }

    if (this.state.groupMemberErrorMesseage.length) {
      this.setState({
        currentGroupMembers: nextSelectedGroupMembers,
        groupMemberErrorMesseage: '',
        totalCostErrorMessage: '',
        newrecipient: nextNewRecipient,
      });
    } else {
      this.setState({
        currentGroupMembers: nextSelectedGroupMembers,
        totalCostErrorMessage: '',
        newrecipient: nextNewRecipient,
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
    return Object.assign({}, this.state.newRecipient);
  }

  getIndivCost() {
    let sumAllManualCost = 0;
    let isManualCostCount = 0;

    this.state.currentGroupMembers.forEach((member, index) => {
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
        newRecipient: {},
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
         nextNewRecipient.ispaid = true;
         nextNewRecipient.selected = true;
         nextNewRecipient.cost = indivCost;
         member.ispaid = true;
        }
        // set past recipient's ispaid flag down
        else if (member.email === this.state.newRecipient.email && member.name !== selectedRecipientName) {
          nextSelectedGroupMembers[index].ispaid = false;
        }
      });
      console.log('nextNewREcipient', nextNewRecipient);

      this.setState({
        newRecipient: nextNewRecipient,
        currentGroupMembers: nextSelectedGroupMembers,
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
    // if (this.state.errorMesseage.length) {
    //   this.setState({
    //     errorMesseage: '',
    //   });
    // }

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
      const nextSelectedGroupMembers = this.getCurrentGroupMembers();

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
    });

  }

  render() {
    console.log(this.state)
    // console.log('selected Group Members', this.state.currentGroupMembers);
    // console.log('selected group name', this.state.selectedGroup)
    // console.log('this.state.newrecipient', this.state.newrecipient)


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
        if (member.email !== this.state.newRecipient.email) {
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
            <option>{this.state.newRecipient.username}</option>
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

// export default class EditEvent extends React.Component {
//   constructor() {
//     super();
//     this.state = {
//       groupname: '',
//       oldeventname: '',
//       neweventname: '',
//       olddate: '',
//       newdate: '',
//       newrecipient: {},
//       oldrecipient: {},
//       // participants: [],
//       oldparticipants: [],
//       currentGroupMembers: [],
//       totalCost: 0,
//       errorMesseage: '',
//     };
//
//     this.selectHandleRecipient = this.selectHandleRecipient.bind(this);
//     this.selectHandleMember = this.selectHandleMember.bind(this);
//     this.inputHandleChange = this.inputHandleChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//     this.preCheck = this.preCheck.bind(this);
//     this.getIndivCost = this.getIndivCost.bind(this);
//     this.countSelectedMember = this.countSelectedMember.bind(this);
//     this.getCurrentSelectedMembers = this.getCurrentSelectedMembers.bind(this);
//     this.getCurrentGroupMembers = this.getCurrentGroupMembers.bind(this);
//   }
//
//   componentWillMount() {
//     const selectedEventData = JSON.parse(this.props.params.eventInfo);
//
//     // all group data I belong info
//     const getGroupData = axios.get('http://localhost:3000/api/transaction?type=post');
//
//     // get target Event info
//     const getEventData = axios.get(`http://localhost:3000/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`);
//
//     Promise.all([getGroupData, getEventData])
//     .then((res) => {
//       const groupData = JSON.parse(res[0].data);
//       const eventData = JSON.parse(res[1].data);
//
//       // calculate the total cost
//       const totalCost = eventData.participants.reduce((total, member) => {
//         return total + member.cost;
//       }, 0);
//
//       let selectedGroupMember = groupData.filter((member) => {
//         return member.groupname === eventData.groupname;
//       });
//
//       // storage to contain necessary member info
//       const storage = [];
//       selectedGroupMember.forEach((member) => {
//         storage.push({
//           email: member.email,
//           username: member.username,
//           selected: false,
//           cost: 0,
//           ispaid: false,
//           isManualCost: false,
//         });
//       });
//
//       // here we filter matching participated member and set selected flag to true
//       storage.forEach((member) => {
//         eventData.participants.forEach((selectedMember) => {
//           if (member.email === selectedMember.email) {
//             member.selected = true;
//             member.cost = selectedMember.cost;
//           }
//           if (selectedMember.email === eventData.oldrecipient.email) {
//             member.ispaid = true;
//           }
//         });
//
//       });
//
//       // here we prevent the error when eventData has no newrecipent....
//       // eventually we need to delete this part
//       let newrecipientInfo;
//
//       if (eventData.newrecipient) {
//         newrecipientInfo = eventData.newrecipient;
//       } else {
//         newrecipientInfo = '';
//       }
//
//       console.log('eventData:::::', eventData)
//       this.setState({
//         groupname: eventData.groupname,
//         oldeventname: eventData.eventname,
//         neweventname: eventData.eventname,
//         olddate: eventData.date,
//         newdate: eventData.date,
//         newrecipient: eventData.newrecipient,
//         oldrecipient: eventData.oldrecipient,
//         // participants: eventData.participants,
//         oldparticipants: eventData.participants,
//         totalCost: totalCost,
//         currentGroupMembers: storage,
//       });
//     });
//   }
//
//   getCurrentGroupMembers() {
//     return this.state.currentGroupMembers.map((member) => {
//       return member;
//     });
//   }
//
//   getCurrentSelectedMembers() {
//     const storage = [];
//     this.state.currentGroupMembers.forEach((member) => {
//       if (member.selected) {
//         storage.push(member);
//       }
//     });
//     return storage;
//   }
//
//   preCheck() {
//     let nothingChangedCount = 0;
//     const currentParticipants = getCurrentSelectedMembers();
//
//     if (this.state.olddate !== this.state.newdate) {
//       nothingChangedCount += 1;
//     }
//     if (this.state.oldrecipient.email !== this.state.newrecipient.email) {
//       nothingChangedCount += 1;
//     }
//     if (this.state.oldeventname !== this.state.neweventname) {
//       nothingChangedCount += 1;
//     }
//     if (JSON.stringify(currentParticipants) !== JSON.stringify(this.state.oldparticipants)) {
//       nothingChangedCount += 1;
//     }
//
//     if (!nothingChangedCount) {
//       alert('변경된 이벤트 정보가 없습니다');
//       browserHistory.push('/history')
//     }
//     else {
//       this.handleSubmit();
//     }
//   }
//
//   handleSubmit() {
//
//
//     console.log('we are updating this data', {
//       olddate: this.state.olddate,
//       newdate: this.state.newdate,
//       oldrecipient: this.state.oldrecipient,
//       newrecipient: this.state.newrecipient,
//       groupname: this.state.groupname,
//       oldeventname: this.state.oldeventname,
//       neweventname: this.state.neweventname,
//       participants: this.getCurrentSelectedMembers(),
//     });
//
//     axios.put(`http://localhost:3000/api/transaction`,
//       {
//         olddate: this.state.olddate,
//         newdate: this.state.newdate,
//         oldrecipient: this.state.oldrecipient,
//         newrecipient: this.state.newrecipient,
//         groupname: this.state.groupname,
//         oldeventname: this.state.oldeventname,
//         neweventname: this.state.neweventname,
//         participants: this.getCurrentSelectedMembers(),
//       })
//       .then((res) => {
//         if (res.status === 200) {
//           alert('이벤트가 성공적으로 수정되었습니다.')
//           browserHistory.push('/history');
//         }
//         else if (res.status === 401) {
//           alert('이벤트 수정권한이 없습니다');
//           browserHistory.push('/history');
//         }
//         else {
//           console.log('시스템 오류로 수정에 실패했습니다')
//         }
//       });
//   }
//
//   countSelectedMember() {
//     // to evaluate the number of selected members
//     let count = 0;
//     if (this.state.currentGroupMembers) {
//       this.state.currentGroupMembers.forEach((member) => {
//         if (member.selected) {
//           count += 1;
//         }
//       });
//     } else {
//       count = 1;
//     }
//     return count;
//   }
//
//   getIndivCost() {
//     let sumAllManualCost = 0;
//     let isManualCostCount = 0;
//
//     this.state.currentGroupMembers.forEach((member, index) => {
//       if (member.isManualCost) {
//         sumAllManualCost += member.cost;
//         isManualCostCount += 1;
//       }
//     });
//
//     // this calculation is unsure
//     // const indivCost = 100 * Math.ceil(((this.state.totalCost - sumAllManualCost) / ((length - isManualCostCount) * 100)));
//     const count = this.countSelectedMember();
//     const indivCost = (this.state.totalCost - sumAllManualCost) / (count - isManualCostCount);
//     return indivCost;
//   }
//
//   inputHandleChange(event) {
//
//     // onChange handle the total cost input
//     if (event.target.type === 'number') {
//       const nextCurrentGroupMembers = this.getCurrentGroupMembers();
//       const indivCost = this.getIndivCost();
//
//       // if (this.state.participants.length > 0) {
//       //   indivCost = 100 * Math.ceil((event.target.value / (this.state.participants.length * 100)));
//       // }
//
//       nextCurrentGroupMembers.forEach((member) => {
//         if (member.selected && !member.isManualCost) {
//           member.cost = indivCost;
//         }
//       });
//
//       // const nextGroupMemberList = this.state.currentGroupMembers.map((member) => {
//       //   return member;
//       // })
//
//       // nextGroupMemberList.forEach((member) => {
//       //   nextCurrentGroupMembers.forEach((participant) => {
//       //     if (member.email === participant.email) {
//       //       member.cost = indivCost;
//       //     }
//       //   });
//       // });
//
//       this.setState({
//         // participants: nextCurrentGroupMembers,
//         currentGroupMembers: nextGroupMemberList,
//       })
//
//     }
//     else if (event.target.type === 'date') {
//       this.setState({
//         newdate: event.target.value,
//         dateStyle: '',
//       });
//     }
//     else if (event.target.type === 'text') {
//       this.setState({
//         neweventname: event.target.value,
//         eventNameStyle: '',
//       });
//     }
//   }
//
//   selectHandleRecipient(event) {
//
//     // const nextParticipants = this.state.participants.map((member) => {
//     //   return member;
//     // })
//     const selectedRecipientName = event.target.value;
//     const nextSelectedGroupMember = this.getCurrentSelectedMembers();
//     let nextNewRecipient ;
//
//     nextSelectedGroupMember.forEach((member, index) => {
//       if (member.username === selectedRecipientName) {
//         member.ispaid = true;
//         member.selected = true;
//         nextNewRecipient = nextSelectedGroupMember[index]
//       }
//       else if (member.email === this.state.newrecipient.email
//         && member.username !== selectedRecipientName) {
//         member.ispaid = false;
//       }
//     })
//     console.log(nextNewRecipient, nextSelectedGroupMember)
//     this.setState({
//       newrecipient: nextNewRecipient,
//       selectedGroupMember: nextSelectedGroupMember,
//       // participants: nextSelectedGroupMember,
//     })
//
//
//     console.log(event.target.value);
//   }
//
//   selectHandleMember(event, selectedMember) {
//
//     console.log(selectedMember)
//
//     // deep copy
//     let nextGroupMemberList = this.state.currentGroupMembers.map((member) => {
//       return member;
//     });
//
//     // toggle selected flag
//     nextGroupMemberList.forEach((member) => {
//       if (member.email === selectedMember.email) {
//         member.selected = !member.selected;
//       }
//     });
//
//     const nextParticipants = nextGroupMemberList.filter((member) => {
//       return member.selected === true;
//     });
//
//
//     let count = 0;
//     if (nextParticipants) {
//       count = nextParticipants.length
//     } else {
//       count = 1
//     }
//
//     const indivCost = 100 * Math.ceil((this.state.totalCost / (count * 100)));
//
//     // const indivCost = this.state.totalCost / count;
//     nextParticipants.forEach((member) => {
//       member.cost = indivCost;
//     });
//
//     nextGroupMemberList.forEach((member) => {
//       if (member.selected) {
//         member.cost = indivCost;
//       }
//     });
//
//     let clearNewrecipient = this.state.newrecipient;
//
//     if (this.state.newrecipient.email === selectedMember.email){
//       if (!selectedMember.selected) {
//         clearNewrecipient = {username: '정산자 선택!'}
//       }
//     }
//
//     this.setState({
//       participants: nextParticipants,
//       currentGroupMembers: nextGroupMemberList,
//       newrecipient: clearNewrecipient
//     });
//   }
//
//   render() {
//     console.log("this state::::", this.state)
//
//     // this only renders members except for the past recipient. The recipient will be rendered hard-coded later
//     const recipientList = this.state.participants.map((member) => {
//       if (member.email !== this.state.newrecipient.email) {
//         return <option>{member.username}</option>
//       }
//     });
//
//     let userTable;
//     if (Object.keys(this.state.currentGroupMembers).length > 0 && this.state.totalCost > 0) {
//       userTable = this.state.currentGroupMembers.map((member, index) => {
//         if (member.selected) {
//           return (
//             <tr onClick={(event) => this.selectHandleMember(event, member)} className="selected">
//               <td>
//                {member.username} ({member.email})
//             </td>
//               <input
//              type="number" placeholder={this.state.currentGroupMembers[index].cost}
//              />
//             </tr>);
//         } else {
//           return (
//             <tr onClick={(event) => this.selectHandleMember(event, member)} className="unselected">
//               <td>
//                 {member.username} ({member.email})
//            </td>
//          </tr>);
//         }
//       })
//     }
//     else {
//       userTable = [];
//     }
//
//     return (
//       <div>
//         <p>
//         그룹 :
//         {this.state.groupname}
//         </p>
//         <p>
//         언제 :
//         <input
//           name="eventDate" className={this.state.dateStyle} type="date"
//           onChange={this.inputHandleChange} />
//         </p>
//         <p>
//         어디서 :
//         <input
//           type="text" className={this.state.eventNameStyle} placeholder={this.state.oldeventname}
//           onChange={this.inputHandleChange} />
//         </p>
//         <p>
//         돈 낸 사람 :
//         <select
//           name="recipientList" className={this.state.recipientStyle}
//           onChange={this.selectHandleRecipient} >
//           <option>{this.state.newrecipient.username}</option>
//           {recipientList}
//         </select>
//         </p>
//         <p>
//         총액 :
//         <input
//           name="eventCost" className={this.state.costStyle} type="number"
//           placeholder={this.state.totalCost} onChange={this.inputHandleChange} />
//         </p>
//         <p>
//         누구랑 :
//         <table>
//           {userTable}
//         </table>
//         </p>
//         <br />
//         <input type="button" className="inputData" value="이벤트 수정" onClick={this.handleSubmit} />
//         <br />
//         <br />
//       </div>
//     );
//   }
// }
