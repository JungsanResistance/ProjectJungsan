import React from 'react';
import axios from 'axios';

export default class AddNewGroup extends React.Component {

  constructor() {
    super();
    this.state = {
      groupname: '',
      groupmembers: [],
      emailToBeChecked: '',
      errorMessage: '',
      fakeMembers: [
        { name: 'woonghee',
          email: 'w@gmail.com',
          active: true,
      },
        { name: 'ilmo',
        email: 'i@gmail.com',
        active: true,
      },
        { name: 'sanghoon',
          email: 's@gmail.com',
          active: true,
      },
        { name: 'jin',
        email: 'j@gmail.com',
        active: true,
      },
        { name: 'jun',
        email: 'jun@gmail.com',
        active: false,
      }
    ]
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleAddMember = this.handleAddMember.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
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
    const filteredData = this.state.fakeMembers.filter((data) => {
      return data.email === this.state.emailToBeChecked;
    })
    if (filteredData.length) {
      const nextGroupmembers = this.state.groupmembers;
      if (this.state.groupmembers.indexOf(filteredData[0].name) === -1) {
        nextGroupmembers.push(filteredData[0].name);
        this.setState({
            groupmembers: nextGroupmembers,
            errorMessage: '',
        })
      }
      else {
        this.setState({
          errorMessage: 'user is already added!'
        })
      }
    }
    else {
      this.setState({
        errorMessage: 'user email does not exist!',
      })
    }

    // axios.get(`http://localhost:3000/api/group?email=${this.state.emailToBeChecked}`)
    // .then((res) => {
    //   console.log(res);
    //   //
    //   // if(res === ) {
    //   //
    //   // }
    //
    // });

  }

  handleKeyPress(event) {
    if(event.charCode === 13) {
      this.handleAddMember();
    }
  }


  render() {
    const groupMembers = this.state.groupmembers.map((data) => {
      return <p>{data}</p>
    })

    return (
      <div>
        New Group Name:
        <input type="text" className='inputGroupName'
          onChange={this.handleInput} />
        <br />
        <br />
        Add Members:
        <input type="text" className="addGroupMembers" placeholder='ex) wnghee91@gmail.com'
          onChange={this.handleInput} onKeyPress={this.handleKeyPress}/>
        <input type="submit" onClick={this.handleAddMember} value="add"/>
        <p className="errorMessage">{this.state.errorMessage} </p>
        <br />
        <br />
        Following Members will be added to your group: {this.state.groupname}
        <br />
        {groupMembers}
      </div>
    )
  }


}
