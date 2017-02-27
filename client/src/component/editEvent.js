import React from 'react';
import Router, { browserHistory } from 'react-router';
import moment from 'moment';
import axios from 'axios';
import Navbar from './func/navbar';
//정산자가 선택되지 않았을 시 에러 메세지가 필요/////

export default class EditEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      currentgroupname: '',
      oldEventName: '',
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


    // all groups I belong info
    const getGroupData = axios.get('http://localhost:3000/api/transaction?type=post');

    // Event info
    const getEventData = axios.get(`http://localhost:3000/api/transaction?type=put&groupname=${selectedEventData.groupname}&eventname=${selectedEventData.eventname}&date=${selectedEventData.date}`);


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

    axios.put('http://localhost:3000/api/transaction', {
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
        browserHistory.push('/history');
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
    const count = this.countSelectedMember();
    const indivCost = count - isManualCostCount ?
       100 * Math.ceil((this.state.totalCost - sumAllManualCost) / ((count - isManualCostCount) * 100))
       : this.state.selectedGroupMembers[memberIndexHasManualCost];
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


    const highEndDeviation = total + 1000;
    const lowEndDeviation = total - 1000;
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
         nextNewRecipient.ispaid = 1;
         member.ispaid = 1;
         if (!member.isManualCost) {
           nextNewRecipient.cost = indivCost;
         }
        }
        // take care of old recipient member in participant: flag down
        else {
          if (member.email === this.state.newrecipient.email) {
            member.ispaid = 0;
          }
        }
      });

      delete nextNewRecipient.isManualCost;
      delete nextNewRecipient.selected;
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
        newDate: event.target.value,
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
      console.log('new event name', event.target.value)
      this.setState({
        newEventName: event.target.value,
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
        <Navbar />
        <br />
        <br />
        <div className="container-fluid">
          <div className="row">
          <div className="col-md-3"></div>
          <div className="col-md-6">
            <div className="editEventFormBox">
              <div className="newEventFormTop">
                <div className="form-top-left">
                  <h2>이벤트 내용이 잘못됐나요?</h2>
                  <p><h4>잘못된 부분을 고치고 수정버튼 클릭!</h4></p>
                </div>
                <div className="form-top-right">
                  <div className="icon-pencil">
                    <b><span className="glyphicon glyphicon-pencil">
                    </span></b>
                  </div>
                </div>
              </div>
              <div className="newEventFormBottom">
                <form className="newEventForm">
                  <div className="form-group">
                    <b className="editEventGroupname">그룹명 : {this.state.currentgroupname}</b>
                  </div>
                <br />
              <div className="form-group">
                <input
                  name="eventDate" className="form-control dateSelect" type="date"
                  onChange={this.inputHandleChange} />
              </div>
              <div className="form-group">
                <input
                  type="text" className="form-control spaceSelect" placeholder={this.state.oldEventName}
                  onChange={this.inputHandleChange} />
              </div>
              <div className="form-group">
                <select
                  name="recipientList" className="form-control recipientSelect"
                  onChange={this.selectHandleRecipient} >
                  <option>{this.state.newrecipient.username}</option>
                  {recipientTable}
                </select>
              </div>
              <div className="form-group">
                <input
                  name="eventCost" className="form-control costSelect" type="number"
                  placeholder={this.state.totalCost} onChange={this.inputHandleChange} />
              </div>
              <div className="form-group">
                * 멤버의 이름을 클릭하면 금액을 추가할 수 있습니다.
                <br />
                <table className="table table-hover memberSelect">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>금액</th>
                    </tr>
                  </thead>
                  {userTable}
                </table>
              </div>
            </form>
              <div className="form-footer">
                <button type="button" className="btn editEventButton" value="이벤트 등록" onClick={this.handleSubmit}><b>이벤트 수정</b></button>
              </div>
            </div>
            </div>
          </div>
          <div className="col-md-3"></div>
          </div>
        </div>
      </div>
    );
  }
}
