import React from 'react';
import axios from 'axios';

export default class AddNewGroup extends React.Component {

  constructor() {
    super();
    this.state = {
      groupname: '',
      groupmembers: [],
      emailToBeChecked: '',
      userEmailExist: false,
    };

    this.handleInput = this.handleInput.bind(this)
    this.handleAddMember = this.handleAddMember.bind(this)
  }

  handleInput(event) {
    if (event.target.className === 'inputGroupName') {
      this.setState({
        groupname: event.target.value,
      });
    }
    else if (event.target.className === 'addGroupMembers') {
      this.setState({
        emailToBeChecked: event.target.value
      });
    }
  }

  handleAddMember() {
    axios.get(`http://localhost:3000/api/group?email=${this.state.emailToBeChecked}`)
    .then((res) => {
      // if(res === ) {
      //
      // }
      console.log(res);

    });

  }


  render() {
    return (
      <div>
        New Group Name:
        <input type="text" className='inputGroupName'
          onChange={this.handleInput} />
        <br />
        <br />
        Add Members:
        <input type="text" className='addGroupMembers' placeholder='ex) wnghee91@gmail.com'
          onChange={this.handleInput} />
        <input type="submit" onClick={this.handleAddMember} value="add"/>
        {errormessage}
      </div>
    )
  }


}
