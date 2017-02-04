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
    console.log('submit pressed');
    axios.post('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/transaction', JSON.stringify({
      groupname: this.state.groupname,
      selectedUserList: this.state.selectedUserList,
      eventName: this.state.eventName,
      date: this.state.date,
      cost: this.state.cost,
    }))
    .then(res => {
      console.log('post response:', res)
    })
    .catch((err) => {
      console.log(err)
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
  }

  selectHandleChange (event) {
    // console.log('groupList', this.state.groupList);
    console.log('event', event.target.value)

    if(event.target.value) {
    const nextUserList = this.state.groupList[event.target.value].map(item => {
      return item;
    });
    console.log('nextUserList', nextUserList)
    this.setState({
      userList: nextUserList,
    });

    }
    else if(event.target.value === 'select the group') {
      this.setState({
        userList: [],
      });
    }

  }

  inputHandleChange (event) {
    if(event.target.type === 'date') {
      this.setState({
        date: event.target.value
      })
    }
    else {
      this.setState({
        cost: event.target.value
      })
    }

      this.setState({
        cost: event.target.value,
      })
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
    const getGroupKeyArray = Object.keys(this.state.groupList);
    const groupSelection = getGroupKeyArray.map(item => {
      return <option>{item}</option>
    })

    // if(this.state.userList.length){
      const userTable = this.state.userList.map((item, index) => {
        return <td onClick={this.selectHandleMember} id={item} className="unselected"  >{item}</td>
      })
    // }
    // else {
    //   const userTable = <td>['haha']</td>;
    // }

    return(
      <div>
        <form >
        select your group :
        <label>
          <select name="eventGroup" className="groupSelect"
            onChange={this.selectHandleChange}  >
          <option>select the group</option>
          {groupSelection}
          </select>
        </label>
          <br />
          <br />

          select members :
          <table>
            {userTable}
          </table>

          select the event date :
          <p>
          <input name="eventDate" className="inputDate" type="date" placeholder={moment().format('YYYY-MM-DD')}
            onChange={this.inputHandleChange}/>
          </p>

          total event cost :
          <input name="eventCost" className="inputEventCost"  type="number"
            onChange={this.inputHandleChange}/>

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
