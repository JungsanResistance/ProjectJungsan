import React from 'react';
import moment from 'moment';
import axios from 'axios';
import Router, { browserHistory } from 'react-router'

/* AWS url
http://localhost:3000/
*/

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
      errorMesseage: '',
      groupMemberErrorMesseage: '',

      groupStyle: '',
      dateStyle: '',
      eventNameStyle: '',
      recipientStyle: '',
      costStyle: '',
      // userList: [],
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.selectHandleChange = this.selectHandleChange.bind(this);
    this.inputHandleChange = this.inputHandleChange.bind(this);
    this.selectHandleMember = this.selectHandleMember.bind(this);
    this.blankCheck = this.blankCheck.bind(this);
  }
  componentWillMount() {
    axios.get('http://localhost:3000/api/transaction?type=post')
    .then((res) => {
      const getData = JSON.parse(res.data);
      const groupStorage = {};
      console.log(getData)
      //
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
      //
      console.log(groupStorage)
      this.setState({
        myAllGroupUserData: groupStorage,
      });
    });
  }

  blankCheck() {

    console.log("newrecipient::::::",this.state.newrecipient)

    let count = 0;
    let groupMemberCount = 0;
    let nextGroupStyle, nextDateStyle, nextEventNameStyle, nextNewRecipientStyle, nextCostStyle;

    if (this.state.selectedGroup === '') {
      nextGroupStyle = "inputStyle";
      count += 1;
    }
    if (this.state.date === '') {
      nextDateStyle = "inputStyle";
      count += 1;
    }
    if (!this.state.eventName.length) {
      nextEventNameStyle = "inputStyle";
      count += 1;
    }
    if (!Object.keys(this.state.newrecipient).length){
      nextNewRecipientStyle = "inputStyle";
      count += 1;
    }
    if (!(this.state.totalCost > 0)) {
      nextCostStyle = "inputStyle";
      count += 1;
    }

    if (!this.state.selectedUserListToBeSent.length) {
      groupMemberCount += 1;
    }

    this.setState({
      groupStyle: nextGroupStyle,
      dateStyle: nextDateStyle,
      eventNameStyle: nextEventNameStyle,
      recipientStyle: nextNewRecipientStyle,
      costStyle: nextCostStyle,
    })

    if (!count && !groupMemberCount) {
      this.handleSubmit();
    } else {
      if (count) {
        this.setState({
          errorMesseage: '빈칸을 모두 채워주세요 ㅠ',
        })
      }
      if (groupMemberCount) {
        this.setState({
          groupMemberErrorMesseage: '함께 식사한 친구들을 선택해주세요',
        })
      }
    }

  }



  handleSubmit() {

    // this.blankCheck()
    console.log('submit pressed');
    console.log({date: this.state.date,
          oldrecipient: this.state.oldrecipient,
          newrecipient: this.state.newrecipient,
          groupname: this.state.selectedGroup,
          eventname: this.state.eventName,
          participants: this.state.selectedUserListToBeSent})
    axios.post('http://localhost:3000/api/transaction', {
      date: this.state.date,
      oldrecipient: this.state.oldrecipient,
      newrecipient: this.state.newrecipient,
      groupname: this.state.selectedGroup,
      eventname: this.state.eventName,
      participants: this.state.selectedUserListToBeSent,
    })
    .then((res) => {
      console.log(res)
      if (res.status === 201) {
        alert('이벤트가 등록되었습니다.')
        browserHistory.push('/mypage');
      } else {
        alert('빈칸을 확인해주세요 ^^')
        console.log('post response:', res);
      }
    });
  }

  selectHandleMember(event, selectedMember) {
    const nextSelectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup].map((member) => {
      return member;
    })

    nextSelectedGroupMember.forEach((member) => {
      if(member.email === selectedMember.email) {
        member.selected = !member.selected;
      }
    })

    const nextSelectedUserListToBeSent = nextSelectedGroupMember.filter((member) => {
      return member.selected === true;
    })
    //복붙/
    const newSelectedUserList = Object.assign({}, this.state.newSelectedUserList)
    let count = 0;
    if(this.state.selectedGroupMember){
      this.state.selectedGroupMember.forEach((member) => {
        if(member.selected) {
          count += 1;
        }
      })
    } else {
      count = 1;
    }

    const indivCost = this.state.totalCost/count;
    console.log(indivCost)
    for(let member in newSelectedUserList) {
      newSelectedUserList[member].cost = indivCost
    }

    const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData)
    for(let member in nextMyAllGroupUserData[this.state.selectedGroup]) {
      nextMyAllGroupUserData[this.state.selectedGroup][member].cost = indivCost
    }
    //복붙//

    if (this.state.groupMemberErrorMesseage.length) {
      this.setState({
        selectedGroupMember : nextSelectedGroupMember,
        selectedUserListToBeSent : nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
        groupMemberErrorMesseage: '',
      })
    } else {
      this.setState({
        selectedGroupMember : nextSelectedGroupMember,
        selectedUserListToBeSent : nextSelectedUserListToBeSent,
        myAllGroupUserData: nextMyAllGroupUserData,
      })
    }


  }

  selectHandleChange(event) {



    if (this.state.errorMesseage.length) {
      this.setState({
        errorMesseage: '',
      })
    }

    if (event.target.name === 'eventGroup') {
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
          })
        }
      console.log("value::",event.target.value)
      this.state.myAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
        if (member.username === event.target.value) {
          console.log("member username :::", member.username)
          const nextNewRecipient = Object.assign({}, this.state.myAllGroupUserData[this.state.selectedGroup][index])
          console.log("next::::",nextNewRecipient)
          nextNewRecipient.ispaid = true;
          this.setState({
            newrecipient: nextNewRecipient,
            oldrecipient: nextNewRecipient,
            recipientStyle: '',
          });
          // console.log("newrecipient::",this.state.newrecipient)
        }
      })
    }
  }

  inputHandleChange(event) {

    if (this.state.errorMesseage.length) {
      this.setState({
        errorMesseage: '',
      })
    }

    if (event.target.type === 'date') {
      this.setState({
        date: event.target.value,
        dateStyle: '',
      });
    }
    else if (event.target.type === 'number') {

      const newSelectedUserList = Object.assign({}, this.state.newSelectedUserList)
      let count = 0;
      if(this.state.selectedGroupMember){
        this.state.selectedGroupMember.forEach((member) => {
          if(member.selected) {
            count += 1;
          }
        })
      } else {
        count = 1;
      }

      const indivCost = event.target.value/count;
      for(let member in newSelectedUserList) {
        newSelectedUserList[member].cost = indivCost
      }

      const nextMyAllGroupUserData = Object.assign({}, this.state.myAllGroupUserData)
      for(let member in nextMyAllGroupUserData[this.state.selectedGroup]) {
        nextMyAllGroupUserData[this.state.selectedGroup][member].cost = indivCost
      }

      this.setState({
        totalCost: parseInt(event.target.value),
        selectedUserListToBeSent: newSelectedUserList,
        myAllGroupUserData: nextMyAllGroupUserData,
        costStyle: '',
      });
    }
    else if (event.target.type === 'text') {
      this.setState({
        eventName: event.target.value,
        eventNameStyle: '',
      });
    }
  }

  render() {
    // console.log(this.state)
    // console.log('this.state', this.state);
    const getGroupKeyArray = Object.keys(this.state.myAllGroupUserData);
    const groupSelection = getGroupKeyArray.map((item) => {
      return <option>{item}</option>;
    });

    //question to namse//
    let userTable;
    const selectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup];
    console.log('selectedGroup:', this.state.selectedGroup)
    if(Object.keys(this.state.myAllGroupUserData).length > 0 && this.state.selectedGroup.length > 0 ){
      userTable = selectedGroupMember.map((member, index) => {
        if(selectedGroupMember[index].selected) {
          //question to namse, why !0 not working//
          return (<tr
             onClick={() => this.selectHandleMember(event, member)} className="selected">
             <td>
             {member.username} ({member.email})

           </td>
           <input
             type='number' placeholder={this.state.myAllGroupUserData[this.state.selectedGroup][index].cost}
             />
           </tr>)

        } else {
          return (<tr
             onClick={() => this.selectHandleMember(event, member)} className="unselected">
             <td>
             {member.username} ({member.email})
           </td>
           </tr>)
        }
      });
    }
    else {
      //question to namse//
      userTable = [];
    }
    //
    // const nextUserList = this.state.myAllGroupUserData[event.target.value].map((item) => {
    //   return item.username;
    // });

    let recipientTable;

    if (this.state.selectedGroup.length){
      recipientTable = this.state.myAllGroupUserData[this.state.selectedGroup].map((member) => {
        return <option>{member.username}</option>;
      });
    } else {
      recipientTable = [];
    }


    return (
      <div>
        <form >

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
          {this.state.errorMesseage}
        </form>
      </div>
    );
  }
}
