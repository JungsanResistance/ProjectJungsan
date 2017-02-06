import React from 'react';
import moment from 'moment';
import axios from 'axios';

/* AWS url
http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/
*/

export default class EventForm extends React.Component {
  constructor(){
    super();
    this.state = {
      groupname: '',
      selectedUserList: [],
      eventName: '',
      date: '',
      recipient:'이성준',
      cost: 0,
      groupList: {},
      userList: []
    }
    this.handleSubmit=this.handleSubmit.bind(this);
    this.selectHandleChange=this.selectHandleChange.bind(this);
    this.inputHandleChange=this.inputHandleChange.bind(this);
    this.selectHandleMember=this.selectHandleMember.bind(this);
  }

  handleSubmit () {
    //ajax post
    // console.log(typeof this.state.cost)

    console.log('submit pressed');
    axios.post('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction', {
      groupname: this.state.groupname,
      selectedUserList: this.state.selectedUserList,
      eventName: this.state.eventName,
      date: this.state.date,
      recipient: this.state.recipient,
      cost: this.state.cost,
    })
    .then(res => {
      //fix here so it redirects to '/' after event form submit pressed
      console.log('post response:', res);
      // if(res === 200)
      this.context.router.push('/');
    })
    .catch((err) => {
      console.log('error!!: ',err);

    })
    // console.log('heyheyhey')
  }
  selectHandleMember (event) {
    console.log(event.target.id)
    if(event.target.className === "selected"){
      event.target.className = "unselected";
    }
    else {
      event.target.className = "selected";
    }

    const nextSelectedUserList = [...this.state.selectedUserList];
    const userIndex = this.state.selectedUserList.indexOf(event.target.id);
    if ( userIndex === -1) {
      nextSelectedUserList.push(event.target.id);
      this.setState({
        selectedUserList: nextSelectedUserList
      });
    } else {
      nextSelectedUserList.splice(userIndex, 1);
      this.setState({
        selectedUserList: nextSelectedUserList
      });
    }
  }

  selectHandleChange (event) {

    console.log('event', event.target.value)
    console.log(event.target.name)
    if(event.target.name === 'eventGroup') {

      if(event.target.value) {
        const nextUserList = this.state.groupList[event.target.value].map(item => {
        return item;
        });
        console.log('nextUserList', nextUserList)
        this.setState({
          userList: nextUserList,
          groupname: event.target.value
        });
      }

      else if (event.target.value === 'select the group') {
        this.setState({
          userList: [],
        });
      }
    }

    else if (event.target.name === 'recipientList') {
      this.setState({
        recipient: event.target.value
      })
    }


  }

  inputHandleChange (event) {
    if(event.target.type === 'date') {
      this.setState({
        date: event.target.value
      })
    }
    else if(event.target.type === 'number') {
      this.setState({
        cost: parseInt(event.target.value)
      })
    }
    else if(event.target.type === 'text') {
      this.setState({
        eventName: event.target.value
      })
    }

      // this.setState({
      //   cost: event.target.value,
      // })
  }

  componentWillMount() {
    axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction')
    .then( res => {
      const getData = JSON.parse(res.data);

      const groupStorage = {};

      getData.forEach((item, index) => {
        groupStorage[item.groupname] = [];
      })

      getData.forEach( item => {
        groupStorage[item.groupname].push(item.username);
      })

      this.setState({
        groupList: groupStorage
      })
    })
  }
  render () {

    console.log('this.state', this.state)
    console.log(typeof this.state.cost)
    const getGroupKeyArray = Object.keys(this.state.groupList);
    const groupSelection = getGroupKeyArray.map(item => {
      return <option>{item}</option>
    })

      const userTable = this.state.userList.map((item, index) => {
        return <td onClick={this.selectHandleMember} id={item} className="unselected"  >{item}</td>
      })

      const recipientTable = this.state.userList.map((item, index) => {
        return <option>{item}</option>
      })

    return(
      <div>
        <form >

        select the event date :
        <p>
          <input name="eventDate" className="inputDate" type="date" placeholder={moment().format('YYYY-MM-DD')}
            onChange={this.inputHandleChange}/>
        </p>

        <p>
          event name :
          <input type="text" placeholder="where did you eat?" onChange={this.inputHandleChange}></input>
        </p>

        select your group :

          <select name="eventGroup" className="groupSelect"
            onChange={this.selectHandleChange}  >
          <option>select the group</option>
          {groupSelection}
          </select>
          <br />
          <br />

          select members :
          <table>
            {userTable}
          </table>

          <br/>
          <br/>


          select recipient :
          <select name="recipientList" className="recipientSelect"
            onChange={this.selectHandleChange}  >
            <option>select the recipient</option>
            {recipientTable}
          </select>

          <p>
            total event cost :
            <input name="eventCost" className="inputEventCost"  type="number"
              onChange={this.inputHandleChange}/>
          </p>

          <br />
          <br />
          <input type="submit" value="submit" onClick={this.handleSubmit}/>
        </form>

      </div>
    )
  }
}

// EventFrom.defaultProps = {
//   groupname: '',
//   selectedUserList: [],
//   eventName: '',
//   date: '',
//   cost: 0,
//   groupList: {},
//   userList: []
// }
