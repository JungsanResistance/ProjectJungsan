import React from 'react';
import moment from 'moment';
import axios from 'axios';
import Router, { browserHistory } from 'react-router';
import Navbar from './func/navbar';

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
    this.updateIndivCostDisplay = this.updateIndivCostDisplay.bind(this);
    this.checkTotal = this.checkTotal.bind(this);
    this.addAll = this.addAll.bind(this);
    this.updateRecipientInfo = this.updateRecipientInfo.bind(this);
    this.updateAll = this.updateAll.bind(this);
  }

  componentWillMount() {
    const getGroupData = axios.get('http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=post');
    const getAllEvents = axios.get('http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/history');

    Promise.all([getGroupData, getAllEvents]).then((res) => {
      console.log('res', res)
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
          ispaid: 0,
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
    let nextErrorMessage, nextGroupMemberErrorMessage, nextTotalCostErrorMessage;
    const currentGroupMembers = this.state.myAllGroupUserData[this.state.selectedGroup];

    if (this.state.selectedGroup === '') {
      nextGroupStyle = 'inputStyle';
      nextErrorMessage = '그룹을 선택해 주세요'

      this.setState({
        groupStyle: nextGroupStyle,
        errorMesseage: nextErrorMessage,
      });
    }
    else {
      if (this.state.date === '') {
        nextDateStyle = 'inputStyle';
        errCount += 1;
      }

      if (this.state.eventName) {
        if (!this.state.eventName.length) {
          nextEventNameStyle = 'inputStyle';
          errCount += 1;
        }
      }

      if (!Object.keys(this.state.newrecipient).length) {
        nextNewRecipientStyle = 'inputStyle';
        errCount += 1;
      }
      if (!(this.state.totalCost > 0)) {
        nextCostStyle = 'inputStyle';
        errCount += 1;
      }

      if (this.state.totalCost < 1000) {
        errCount += 1;
      }

      if (currentGroupMembers) {
        currentGroupMembers.forEach((member) => {
          if (member.selected && member.cost <= 0) {
            memberCostCheck = false;
          }
        });
      }

      const isRecipientSelected = currentGroupMembers ? currentGroupMembers.some((member) => {
        if (member.selected)
          return member.email === this.state.newrecipient.email
      }) : false;

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
      }, () => {
        const handleSubmitCondition = !errCount && anyMemberSelected
          && receipientSelectedFlag && this.checkTotal() && memberCostCheck;

        if (handleSubmitCondition) {
          if (!this.state.eventErrorMesseage.length) {
            this.handleSubmit();
          }
        }
        else {

          if (!this.state.groupname) {
            nextErrorMessage = '그룹을 선택해 주세요'
          }
          if (!receipientSelectedFlag) {
              nextErrorMessage = '정산자를 포함시켜주세요';
          }
          if (errCount) {
              nextErrorMessage = '빈칸을 모두 채워주세요';
          }
          if (!anyMemberSelected) {
              nextGroupMemberErrorMessage = '함께 식사한 친구들을 선택해주세요';
          }
          if (!memberCostCheck) {
            nextTotalCostErrorMessage = '모든 금액은 0원보다 커야합니다';
          }
          if (!this.checkTotal()) {
              nextTotalCostErrorMessage = '총 금액이 맞지 않습니다';
          }
          if (this.state.totalCost < 1000) {
            nextTotalCostErrorMessage = '총 금액은 1,000 원 이상이어야 합니다';
          }
          this.setState({
            errorMesseage: nextErrorMessage,
            groupMemberErrorMesseage: nextGroupMemberErrorMessage,
            totalCostErrorMessage: nextTotalCostErrorMessage,
          });
        }
      });
    }
  }

  // post new transaction record
  handleSubmit() {
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
    // trim uncessary participant property
    const onlySelectedGroupMembers = [];
    nextSelectedGroupMembers.forEach((member) => {
      if (member.selected) {
        delete member.isManualCost;
        delete member.selected;
        onlySelectedGroupMembers.push(member);
        }
    });

    console.log('==============this is the data we are sending', {
      date: this.state.date,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.selectedGroup,
      eventname: this.state.eventName,
      participants: onlySelectedGroupMembers,
    });

    // this is temp code for catching bug at newrecipient === participant  recipient compare test at backend
    // I would like not to post if they are not the selectedRecipientName
    // in the future if the bug is all resolved and stable, let's delete this part and rely on backend error report
    let compare;
    nextSelectedGroupMembers.forEach((member) => {
      if (member.email === this.state.newrecipient.email) {
        const recipient = JSON.stringify(this.state.newrecipient);
        const participant = JSON.stringify(member);
        console.log(recipient, participant);
        if (recipient === participant) {
          compare =  true;
        }
        else {
          compare = false;
        }
      }
    });
    console.log(compare)
    if (!compare) {
      alert('newrecipient !== participant');
      console.log('newrecipient', this.state.newrecipient, 'participant', nextSelectedGroupMembers)
    }

    else {
      axios.post('http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/transaction', {
        date: this.state.date,
        oldrecipient: this.state.oldrecipient,
        newrecipient: this.state.newrecipient,
        groupname: this.state.selectedGroup,
        eventname: this.state.eventName,
        participants: onlySelectedGroupMembers,
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
        console.log(member.selected)
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

      // const indivCost = 100 * Math.ceil(this.state.totalCost / (count * 100));
      // i'm not sure if this get IndivCost is based on the changes above..
    const indivCost = this.getIndivCost();
    const nextNewRecipient = this.getCurrentRecipient();

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
        if (member.selected && !member.isManualCost) {
          member.cost = this.state.totalCost;
          member.isManualCost = false;
        }
        else {
          member.cost = 0;
        }
      });
    }

    if (this.state.groupMemberErrorMesseage) {
      this.setState({
        selectedGroupMembers: nextSelectedGroupMembers,
        groupMemberErrorMesseage: '',
        totalCostErrorMessage: '',
      }, () => {
        this.addAll();
        this.updateRecipientInfo();
        this.updateIndivCostDisplay();
      });
    } else {
      this.setState({
        selectedGroupMembers: nextSelectedGroupMembers,
        totalCostErrorMessage: '',
      }, () => {
        this.addAll();
        this.updateRecipientInfo();
        this.updateIndivCostDisplay();
      });
    }
  }

  updateRecipientInfo() {

    const indivCost = this.getIndivCost();
    const nextNewRecipient = this.getCurrentRecipient();
    const nextSelectedGroupMembers = this.state.selectedGroupMembers;
    console.log('current recipient is ', JSON.stringify(nextNewRecipient));
    nextSelectedGroupMembers.forEach((member) => {
      if (member.email === nextNewRecipient.email) {
        if (member.selected) {
          nextNewRecipient.ispaid = 1;
          if (member.isManualCost) {
            console.log('recipeint update to this member', member)
            nextNewRecipient.cost = member.cost; // this is not working???
          }
          else {
            console.log('recipient has indivCost', indivCost)
            nextNewRecipient.cost = indivCost;
          }
        }
        else {
          console.log('recipient is not selected!!!!!')
          nextNewRecipient.cost = 0;
          nextNewRecipient.ispaid = 0;
        }
      }
    });
    console.log('recipient is updated as', JSON.stringify(nextNewRecipient));
    this.setState({
      newrecipient: nextNewRecipient,
    })
  }

  // seems this updateAll is not working....
  // however call each function in the callback works... weird
  updateAll() {
    this.addAll();
    this.updateRecipientInfo();
    this.updateIndivCostDisplay();
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
    if (this.state.totalCost < 1000) {
      return 0;
    }
    let sumAllManualCost = 0;
    let isManualCostCount = 0;
    // const nextSelectedGroupMembers = this.state.selectedGroupMembers;
    let memberIndexHasManualCost;
    this.state.selectedGroupMembers.forEach((member, index) => {
      if (member.isManualCost) {
        sumAllManualCost += member.cost;
        isManualCostCount += 1;
        memberIndexHasManualCost = index;
      }
    });

    const count = this.countSelectedMember();
    console.log('selected member count', count, 'is manualCost count', isManualCostCount);
    // assign arithmetic average or just manually input cost
    const indivCost = count - isManualCostCount ?
       100 * Math.ceil((this.state.totalCost - sumAllManualCost) / ((count - isManualCostCount) * 100))
       : this.state.selectedGroupMembers[memberIndexHasManualCost];
    return indivCost;
  }

  evaluateAll() {
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
    const indivCost = this.getIndivCost();
    const nextNewRecipient = this.getCurrentRecipient();
    console.log('nextNewRecipient', nextNewRecipient)
    console.log('indivCost', indivCost)

    if (this.countSelectedMember() === 0) {
      // when no one selected, just n division to all members
      nextSelectedGroupMembers.forEach((member) => {
          member.cost = indivCost; // this.state.totalCost / nextSelectedGroupMembers.length;
          member.selected = true;
      });
    }
    else if (this.countSelectedMember() === 1) {
      // when only one member selected
      nextSelectedGroupMembers.forEach((member) => {
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
      // when thre are more than one member
      nextSelectedGroupMembers.forEach((member) => {
        if (member.selected && !member.isManualCost) {
          if (!member.isManualCost) {
            member.cost = indivCost;
          }
        }
        else if (!member.selected) {
          member.cost = 0;
        }
      });
    }

    let nextTotalCostErrorMessage = '';
    if (this.checkTotal()) {
      nextTotalCostErrorMessage = ''
    }
    else {
      nextTotalCostErrorMessage = '총 금액이 맞지 않습니다'
    }

    this.setState({
      selectedGroupMembers: nextSelectedGroupMembers,
      totalCostErrorMessage: nextTotalCostErrorMessage,
    }, () => {
      this.addAll();
      this.updateRecipientInfo();
      this.updateIndivCostDisplay();
    });
  }

  addAll() {
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
    console.log('see the sum', JSON.stringify(nextSelectedGroupMembers))
    const sum = nextSelectedGroupMembers.reduce((total, member) => {
      return total + member.cost;
    }, 0);

    console.log('sum', sum)

    this.setState({
      sumIndivCost: sum,
    });
  }

  updateIndivCostDisplay() {
    // here we update each member cost
    const indivCost = this.getIndivCost();
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();

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
      selectedGroupMembers: nextSelectedGroupMembers,
    });
  }


  checkTotal() {
    const total = this.state.totalCost;
    const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
    const sumMemberCost = nextSelectedGroupMembers.reduce((total, member) => {
      return total + member.cost;
    }, 0);


    const highEndDeviation = total + 1000;
    const lowEndDeviation = total - 1000;
    // console.log('highEnd', highEndDeviation, 'lowEnd', lowEndDeviation, 'sumMemberCost', sumMemberCost);
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
      if (event.target.value === '어느 그룹이랑?') {
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

      if (selectedRecipientName === "select the recipient") {

        this.setState({
          newrecipient: {},
          groupMemberErrorMesseage: '',
        });
      }

      else {
        let nextNewRecipient;
        const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
        const indivCost = this.getIndivCost();
        const oldRecipient = this.getCurrentRecipient();

        nextSelectedGroupMembers.forEach((member, index) => {
          if (member.username === selectedRecipientName) {
            nextNewRecipient = Object.assign({}, nextSelectedGroupMembers[index]);
            // if (member.selected){
              nextNewRecipient.ispaid = 1;
              member.ispaid = 1;
              if (!member.isManualCost) {
                nextNewRecipient.cost = indivCost;
                // member.cost = indivCost;
              }
            // }
          }
          else {
            // take care of old recipient member in participant: flag down
            if (member.email === oldRecipient.email) {
              member.ispaid = 0;
            }
          }
        });

        // cut unnecessary recipient info
        delete nextNewRecipient.selected;
        delete nextNewRecipient.isManualCost;

        this.setState({
          oldrecipient: nextNewRecipient,
          newrecipient: nextNewRecipient,
          selectedGroupMembers: nextSelectedGroupMembers,
          recipientStyle: '',
        });
      }
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
        return axios.get(`http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=check&groupname=${eventTarget.value}&eventname=${this.state.eventName}&date=${this.state.date}`)

        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.name === 'eventDate') {
        return axios.get(`http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${this.state.eventName}&date=${eventTarget.value}`)

        .then((res) => {
          if (res.data.length-2) {
            return true;
          }
        })
      }
      else if (eventTarget.type === 'text') {
        return axios.get(`http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=check&groupname=${this.state.selectedGroup}&eventname=${eventTarget.value}&date=${this.state.date}`)

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
      const nextSelectedGroupMembers = this.getCurrentSelectedGroupMembers();
      const indivCost = this.getIndivCost();

      nextSelectedGroupMembers.forEach((member) => {
        if (member.selected && !member.isManualCost) {
          member.cost = indivCost;
        }
        else {
          console.log('member not selected')
        }
      });

      this.setState({
        selectedGroupMembers: nextSelectedGroupMembers,
        totalCost: parseInt(event.target.value),
        costStyle: '',
        // indivCost: indivCost,
      }, () => {
        // this.updateAll();
        this.addAll();
        this.updateRecipientInfo();
        this.updateIndivCostDisplay();
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
    }, () => {
      // this.updateAll();
      this.updateIndivCostDisplay();
      this.addAll();
      this.updateRecipientInfo();
    });
  }

  render() {
    // console.log('all group data', this.state.myAllGroupUserData);
    // console.log('selected Group Members', this.state.selectedGroupMembers);
    // console.log('selected group name', this.state.selectedGroup)
    // console.log('this.state.newrecipient', this.state.newrecipient)
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
               type='number' placeholder={selectedGroupMembers[index].cost}
                  onChange={(event) => this.handleManualInputCost(event, index)} />
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
        <Navbar />
        <br />
        <br />
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-6">
              <div className="newEventFormBox">
                <div className="newEventFormTop">
                  <div className="form-top-left">
                    <h3>새로운 이벤트를 만들어보세요!</h3>
                  <p><h4>그룹원간의 채무관계를 쉽게 파악할 수 있습니다.</h4></p>
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
                      <select
                        name="eventGroup" className="form-control groupSelect"
                        onChange={this.selectHandleChange}>
                        <option>어느 그룹이랑?</option>
                        {groupSelection}
                      </select>
                    </div>
                    <div className="form-group">
                      <input
                        name="eventDate" className="form-control dateSelect" type="date"
                        placeholder={moment().format('YYYY-MM-DD')}
                        onChange={this.inputHandleChange} />
                    </div>
                    <div className="form-group">
                      <input
                        type="text" className="form-control spaceSelect" placeholder="어디서?"
                        onChange={this.inputHandleChange} />
                        {this.state.eventErrorMesseage}
                    </div>
                    <div className="form-group">
                      <select
                        name="recipientList" className="form-control recipientSelect"
                        onChange={this.selectHandleChange}>
                        <option>돈 낸 사람은 누구?</option>
                        {recipientTable}
                      </select>
                    </div>
                    <div className="form-group">
                      <input
                          name="eventCost" className="form-control costSelect" type="number"
                          placeholder="총액은?" onChange={this.inputHandleChange} />
                    </div>
                    <div className="form-group">
                      <p className="addCostInfo">
                      * 멤버의 이름을 클릭하면 금액을 추가할 수 있습니다.<br/>
                      * 금액란을 클릭하면 금액을 변경할 수 있습니다.
                      </p>
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
                    <button type="button" className="btn addEventButton" value="이벤트 등록" onClick={this.preCheck}><b>이벤트 등록</b></button>
                  </div>
                </div>
                <p>{this.state.totalCostErrorMessage}</p>
                <br />
                <br />
                {this.state.groupMemberErrorMesseage}
                <br />
              </div>
              </div>
              <div className="col-sm-3"></div>
            </div>
        </div>
        <br />
        <br />
        {this.state.errorMesseage}
      </div>
    );
  }
}
