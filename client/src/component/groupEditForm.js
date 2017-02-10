import React from 'react';
import axios from 'axios';

export default class GroupEditForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      //groupname을 value로 할 경우에는 값이 변하지 않음.//
      //groupname의 default값을 지정하지 않는다면, 사용자가 값을 변경하지 않을 때 groupname이 전송되지 않는다//
      oldGroupname: this.props.params.groupname, // ???????
      newGroupname: this.props.params.groupname,
      emailToBeChecked: '',
      membername: '',
      newGroupmembers: [],
      oldGroupmembers: [],
      errorMemberDuplicate: '',
      errorGroupnameDuplicate: '',
      groupDuplicateFlag: '',
    };
    this.handleAddMember = this.handleAddMember.bind(this);
    this.handleGroup = this.handleGroup.bind(this);
    this.handleGroupMember = this.handleGroupMember.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleMemberDelete = this.handleMemberDelete.bind(this);
    this.handleSubmitGroup = this.handleSubmitGroup.bind(this);
    this.handleGroupName = this.handleGroupName.bind(this);
  }

  componentWillMount() {
    axios.get(`http://localhost:3000/api/groupedit?target=groupmembers&groupname=${this.props.params.groupname}`)
    .then((res) => {
      const groupData = JSON.parse(res.data);
      console.log("groupData ::", groupData)
      //Db로 보내주는 데이터 형태를 고려하여 active, username값만 유지(groupname은 생략)//
      const groupMemberData = groupData.map((data) => {
        return {
          username: data.username,
          active: data.active,
          email: data.email,
        };
      });
      console.log(groupMemberData)
      this.setState({
        newGroupmembers: groupMemberData,
        oldGroupmembers: groupMemberData,
      });
    });
  }

  handleSubmitGroup() {

    const groupMemberCheck = JSON.stringify(this.state.newGroupmembers) === JSON.stringify(this.state.oldGroupmembers);
    const groupNameCheck = this.state.newGroupname === this.state.oldGroupname;

    if ((groupNameCheck === false) && groupMemberCheck) {
      axios.put(`http://localhost:3000/api/groupedit`,
        {
          action: 'modifyGroupName',
          data: {
            oldGroupname: this.state.oldGroupname,
            newGroupname: this.state.newGroupname,
          }
        }
      )
      .then((res) => {
        console.log(res);
      })
    }
    else if (groupNameCheck && (groupMemberCheck=== false)) {
      axios.put(`http://localhost:3000/api/groupedit`,
         {
           action: 'modifyGroupMembers',
           data: {
             oldGroupname : this.state.oldGroupname,
             newGroupname: this.state.newGroupname,
             groupmembers: this.state.newGroupmembers,
          }
         }
      );
    }
    else {
      axios.put(`http://localhost:3000/api/groupedit`,
         {
           action: 'modifyGroupAll',
           data: {
             oldGroupname : this.state.oldGroupname,
             newGroupname: this.state.newGroupname,
             groupmembers: this.state.newGroupmembers,
          }
         }
      );
    }


  };

  handleGroup(event) {
    if (event.target.className === 'editGroupName') {
      this.setState({
        newGroupname: event.target.value,
      });
    }
    else if (event.target.className === 'editGroupMember') {
      this.setState({
        emailToBeChecked: event.target.value,
        errorMemberDuplicate: '',
      });
    }
  }

  handleAddMember() {
    document.body.getElementsByClassName('editGroupMember')[0].value = '';
    axios.get(`http://localhost:3000/api/groupedit?target=email&email=${this.state.emailToBeChecked}`)
    .then((res) => {
      const data = JSON.parse(res.data);
      if (data.length) {
        const nextGroupmembers = this.state.newGroupmembers;
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

  handleGroupMember() {
    document.body.getElementsByClassName('editGroupMember')[0].value = '';

    const nextGroupmembers = [...this.state.newGroupmembers];
    let memberIndex;
    let flag = false;
    nextGroupmembers.forEach((item, index) => {
      if (item.email === this.state.emailToBeChecked) {
        memberIndex = index;
        flag = true;
      }
    });
    if (flag) {
      if (nextGroupmembers[memberIndex].active) {
        this.setState({
          errorMemberDuplicate: 'user is already added!',
        });
      } else {
        nextGroupmembers[memberIndex].active = true;
        this.setState({
          newGroupmembers: nextGroupmembers,
        });
      }
    } else {
      nextGroupmembers.push({
        username: this.state.memberName,
        active: true,
      });
      this.setState({
        newGroupmembers: nextGroupmembers,
      });
    }
  }


  handleKeyPress(event) {
    if (event.charCode === 13) {
      if (event.target.className === 'editGroupMember') {
        this.handleAddMember();
      }
    }
  }

  handleMemberDelete(event) {
    const NextGroupmembers = [...this.state.newGroupmembers];
    NextGroupmembers.map((data) => {
      if (data.username === event.target.name) {
        data.active = false;
      }
    });
    this.setState({
      groupmembers: NextGroupmembers,
      errorMemberDuplicate: '',
    });
  }

  handleGroupName() {
    axios.get(`http://localhost:3000/api/groupedit?target=groupname&groupname=${this.state.newGroupname}`)
    .then((res) => {
      const data = JSON.parse(res.data);
      console.log(data)
      if (data.length) {
        console.log("Herererereeree???")
        this.setState({
          errorGroupnameDuplicate: '이 그룹이름은 이미 있어 띵구야',
          groupDuplicateFlag: "errorMemberDuplicateFalse",
        })
      }
      else {
        console.log(this.state.newGroupname)
          this.setState({
            groupname: this.state.newGroupname,
            errorGroupnameDuplicate: '멋진 그룹 이름이군요!',
            groupDuplicateFlag: "errorMemberDuplicateTrue",
          })
      }
    });
  }

  render() {
    //그룹멤버생성//

    const members = [];
    this.state.newGroupmembers.forEach((data) => {
      if (data.active) {
        members.push(
          <li>
            {data.username} ({data.email})
            <input
            type="submit" name={data.username} value="delete" onClick={this.handleMemberDelete}/>
          </li>)
      }
    });

    return (
      <div>
        <h2>groupname :</h2>
          <input
            type="text" className="editGroupName" placeholder={this.state.oldGroupname}
            onChange={this.handleGroup}/>
          <input type="submit" value="중복확인" onClick={this.handleGroupName} />
          <p className={this.state.groupDuplicateFlag}>{this.state.errorGroupnameDuplicate} </p>
        <br />
        <br />
        <h2>groupmember :</h2>
          Add groupmember :
          <input
            type="text" className="editGroupMember" placeholder=" e.g. wnghee91@gmail.com"
            size="30" onKeyPress={this.handleKeyPress} onChange={this.handleGroup} />
          <input
            type="submit" value="add" onClick={this.handleAddMember} />
        {this.state.errorMemberDuplicate}
        <br />
        <ul>
          {members}
        </ul>
        <input type="submit" value="그룹수정" onClick={this.handleSubmitGroup} />
      </div>
    );
  }
}
