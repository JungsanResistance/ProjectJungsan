import React from 'react';
import moment from 'moment';
import axios from 'axios';

/* AWS url
http://localhost:3000/
*/

export default class EventForm extends React.Component {
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
      // userList: [],
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.selectHandleChange = this.selectHandleChange.bind(this);
    this.inputHandleChange = this.inputHandleChange.bind(this);
    this.selectHandleMember = this.selectHandleMember.bind(this);
  }
  componentWillMount() {
    axios.get('http://localhost:3000/api/transaction')
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
  handleSubmit() {
    console.log('submit pressed');

    axios.post('http://localhost:3000/api/transaction', {
      groupname: this.state.groupname,
      participants: this.state.selectedUserListToBeSent,
      eventname: this.state.eventName,
      date: this.state.date,
      newrecipient: this.state.newrecipient,
      oldrecipient: this.state.oldrecipient,
    })
    .then((res) => {
      console.log('post response:', res);
      this.context.router.push('/mypage');
    })
    .catch((err) => {
      console.log('error!!: ', err);
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
    this.setState({
      selectedGroupMember : nextSelectedGroupMember,
      selectedUserListToBeSent : nextSelectedUserListToBeSent,
      myAllGroupUserData: nextMyAllGroupUserData,
    })
  }

  selectHandleChange(event) {
    if (event.target.name === 'eventGroup') {
      if (event.target.value === 'select the group') {
        this.setState({
          selectedUserListToBeSent: [],
        });
      }
      else if (event.target.value) {
        // const nextUserList = this.state.myAllGroupUserData[event.target.value].map((item) => {
        //   return item.username;
        // });
        this.setState({
          selectedGroup: event.target.value,
          // selectedUserListToBeSent: nextUserList,
          // groupname: event.target.value,
        });
      }
    }
    else if (event.target.name === 'recipientList') {
      console.log(this.state.selectedGroup)
      console.log(this.state.myAllGroupUserData[this.state.selectedGroup])
      this.state.myAllGroupUserData[this.state.selectedGroup].forEach((member, index) => {
        if (member.username === event.target.value) {
          const nextNewRecipient = Object.assign({}, this.state.myAllGroupUserData[this.state.selectedGroup][index])
          nextNewRecipient.ispaid = true;
          this.setState({
            newrecipient: nextNewRecipient,
          });
        }
      })
    }
  }

  inputHandleChange(event) {
    if (event.target.type === 'date') {
      this.setState({
        date: event.target.value,
      });
    }
    else if (event.target.type === 'number') {
      console.log("this.state.newSelectedUserList :",this.state.newSelectedUserList)
      console.log("this.state.selectedUserListToBeSent.length :",this.state.selectedUserListToBeSent.length)
      console.log("event.target.value ::", event.target.value)

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
      console.log(indivCost)
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
      });
    }
    else if (event.target.type === 'text') {
      this.setState({
        eventName: event.target.value,
      });
    }
  }

  render() {
    console.log(this.state)
    // console.log('this.state', this.state);
    const getGroupKeyArray = Object.keys(this.state.myAllGroupUserData);
    const groupSelection = getGroupKeyArray.map((item) => {
      return <option>{item}</option>;
    });

    //question to namse//
    let userTable;
    const selectedGroupMember = this.state.myAllGroupUserData[this.state.selectedGroup];

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

        select your group :
          <select
            name="eventGroup" className="groupSelect"
            onChange={this.selectHandleChange}>
            <option>select the group</option>
            {groupSelection}
          </select>
          <br />
          <br />
          <p>
          select the event date :
          <input
            name="eventDate" className="inputDate" type="date"
            placeholder={moment().format('YYYY-MM-DD')}
            onChange={this.inputHandleChange} />
        </p>
          <p>
            event name :
            <input
              type="text" placeholder="where did you eat?"
              onChange={this.inputHandleChange} />
          </p>

          select recipient :
          <select
            name="recipientList" className="recipientSelect"
            onChange={this.selectHandleChange}>
            <option>select the recipient</option>
            {recipientTable}
          </select>
          <p>
            total event cost :
            <input
              name="eventCost" className="inputEventCost" type="number"
              onChange={this.inputHandleChange} />
          </p>
          <br />
          select members :
          <table>
            {userTable}
          </table>
          <br />
          <br />
          <input type="submit" value="submit" onClick={this.handleSubmit} />
        </form>
      </div>
    );
  }
}
