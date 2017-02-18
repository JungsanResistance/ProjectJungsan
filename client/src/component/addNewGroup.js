import React from 'react';
import axios from 'axios';
import Router, { browserHistory } from 'react-router'
export default class AddNewGroup extends React.Component {

  constructor() {
    super();
    this.state = {
      groupname: '',
      groupmembers: [],
      emailToBeChecked: '',
      errorMemberDuplicate: '',
      errorGroupnameDuplicate: '',
      groupDuplicateFlag: '',
      submitMessage: '',
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleAddMember = this.handleAddMember.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleGroupName = this.handleGroupName.bind(this);
    this.handleMemberDelete = this.handleMemberDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    axios.get('http://localhost:3000/api/misc')
    .then((res) => {
      console.log(res);
      const logInUserData = JSON.parse(res.data);
      this.setState({
        groupmembers: logInUserData,
      })
    })
  }
  handleSubmit() {
    if (!this.state.groupname.length) {
      console.log("empty group name!!");
      this.setState({
        errorGroupnameDuplicate: '그룹 이름좀 넣으라고 이자식아'
      })
    }
    else {
      console.log("groupname::",this.state.groupname,
      "groupmembers::::", this.state.groupmembers,)
      axios.post('http://localhost:3000/api/group', {
        groupname: this.state.groupname,
        groupmembers: this.state.groupmembers,
      })
      .then((res) => {
        if (res.status === 201) {
          console.log('post response:', res);
          browserHistory.push('/mypage');
        } else {
          console.log(res.status)
        }
      })
      .catch((err) => {
        console.log('error!!: ', err);
      });
    }
  }
  handleInput(event) {
    if (event.target.className === 'inputGroupName') {
      this.setState({
        groupname: event.target.value,
        errorGroupnameDuplicate: '',
      });
    }
    else if (event.target.className === 'addGroupMembers') {
      // console.log(this.state.emailToBeChecked)
      this.setState({
        emailToBeChecked: event.target.value,
      });
    }
  }

  handleAddMember() {
    document.body.getElementsByClassName('addGroupMembers')[0].value = '';
    axios.get(`http://localhost:3000/api/groupedit?target=email&email=${this.state.emailToBeChecked}`)
    .then((res) => {
      console.log(res.data);
      const data = JSON.parse(res.data);
      if (data.length) {
        const nextGroupmembers = this.state.groupmembers;
        const duplicateEmailCheck = this.state.groupmembers.some((item) => {
          return item.email === data[0].email;
        });
        console.log(duplicateEmailCheck)
        if (!duplicateEmailCheck) {
          nextGroupmembers.push({
            username: data[0].username,
            email: data[0].email,
          });
          this.setState({
            groupmembers: nextGroupmembers,
            errorMemberDuplicate: '',
          });
        } else {
          this.setState({
            errorMemberDuplicate: 'user is already added!',
          });
        }
      } else {
        this.setState({
          errorMemberDuplicate: 'user email does not exist!',
        });
      }
    });
  }

  handleKeyPress(event) {
    if (event.charCode === 13) {
      if (event.target.className === 'addGroupMembers') {
        this.handleAddMember();
      }
      else {
        this.handleGroupName();
      }
    }
  }

  handleGroupName() {
    if (!this.state.groupname.length) {
      this.setState({
        errorGroupnameDuplicate: '그룹 이름을 입력해주세요',
        groupDuplicateFlag: "errorMemberDuplicateFalse",
      })
    }
    else {
      axios.get(`http://localhost:3000/api/groupedit?target=groupname&groupname=${this.state.groupname}`)
      .then((res) => {
        const data = JSON.parse(res.data);
        if (data.length) {
          this.setState({
            errorGroupnameDuplicate: '이 그룹이름은 이미 있어 띵구야',
            groupDuplicateFlag: "errorMemberDuplicateFalse",
          })
        }
        else {
          console.log(this.state.groupname)
            this.setState({
              groupname: this.state.groupname,
              errorGroupnameDuplicate: '멋진 그룹 이름이군요!',
              groupDuplicateFlag: "errorMemberDuplicateTrue",
            })
        }
      });
    }
  }

  handleMemberDelete(event) {
    const NextGroupmembers = [...this.state.groupmembers];
    NextGroupmembers.forEach((data, index) => {
      if (data.email === event.target.name) {
        NextGroupmembers.splice(index, 1);
      }
    });
    this.setState({
      groupmembers: NextGroupmembers,
      errorMemberDuplicate: '',
    });
  }

  render() {
    const groupMembers = this.state.groupmembers.map((data, index) => {
      if(index !==0) {
        return <li>
          {data.username} ({data.email}) <input
            type="submit" value="delete" name={data.email}
            onClick={this.handleMemberDelete} />
        </li>;
      }
      else {
        return <li>{data.username} ({data.email}) : 그룹장 짱짱님</li>;
      }
    });

    return (
      <div>
        New Group Name:
        <input
          type="text" className="inputGroupName"
          onChange={this.handleInput} onKeyPress={this.handleKeyPress} />
        <input type="submit" value="중복확인" onClick={this.handleGroupName} />
        <p className={this.state.groupDuplicateFlag}>{this.state.errorGroupnameDuplicate} </p>
        <br />
        <br />
        Add Members:
        <input
          type="text" className="addGroupMembers" placeholder="ex) wnghee91@gmail.com"
          onChange={this.handleInput} onKeyPress={this.handleKeyPress} />
        <input type="submit" onClick={this.handleAddMember} value="add" />
        <p className="errorMemberDuplicateFalse">{this.state.errorMemberDuplicate} </p>
        <br />
        <br />
        Following Members will be added to your group: {this.state.groupname}
        <br />
          <ul>
            {groupMembers}
          </ul>
        <br />
        <br />
        <input type="submit" onClick={this.handleSubmit} className="submitNewGroup" />
        <br />
        <br />
        {this.state.submitMessage}
      </div>
    );
  }

}
