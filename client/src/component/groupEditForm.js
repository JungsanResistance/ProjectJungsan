import React from 'react';
import axios from 'axios';

export default class GroupEditForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      //groupname을 value로 할 경우에는 값이 변하지 않음.//
      //groupname의 default값을 지정하지 않는다면, 사용자가 값을 변경하지 않을 때 groupname이 전송되지 않는다//
      groupName: this.props.params.groupname, // ???????
      memberName: '',
      groupMembers: [],
      errorMemberDuplicate: '',
      errorGroupnameDuplicate: '',
    };

    this.handleGroup = this.handleGroup.bind(this);
    this.handleGroupMember = this.handleGroupMember.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleMemberDelete = this.handleMemberDelete.bind(this);
  }

  componentWillMount() {
    axios.get(`http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/groupedit?target=groupmembers&groupname=${this.props.params.groupname}`)
    .then((res) => {
      const groupData = JSON.parse(res.data);
      //Db로 보내주는 데이터 형태를 고려하여 active, username값만 유지(groupname은 생략)//
      const groupMemberData = groupData.map((data) => {
        return {
          username: data.username,
          active: data.active,
        };
      });
      console.log(groupMemberData)
      this.setState({
        groupMembers: groupMemberData,
      });
    });
  }

  handleGroup(event) {
    if (event.target.className === 'editGroupName') {
      this.setState({
        groupName: event.target.value,
      });
    }
    else if (event.target.className === 'editGroupMember') {
      this.setState({
        memberName: event.target.value,
        errorMemberDuplicate: '',
      });
    }
  }

  handleGroupMember() {
    document.body.getElementsByClassName('editGroupMember')[0].value = '';
    const nextGroupmembers = [...this.state.groupMembers];
    let memberIndex;
    let flag = false;

    nextGroupmembers.forEach((item, index) => {
      if (item.username === this.state.memberName) {
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
          groupMembers: nextGroupmembers,
        });
      }
    } else {
      nextGroupmembers.push({
        username: this.state.memberName,
        active: true,
      });
      this.setState({
        groupMembers: nextGroupmembers,
      });
    }
  }


  handleKeyPress(event) {
    if (event.charCode === 13) {
      if (event.target.className === 'editGroupMember') {
        this.handleGroupMember();
      }
    }
  }

  handleMemberDelete(event) {
    const NextGroupmembers = [...this.state.groupMembers];
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

  render() {
    //그룹멤버생성//
    const members = [];
    this.state.groupMembers.forEach((data) => {
      if (data.active) {
        members.push(
          <li>
            {data.username}
            <input
            type="submit" name={data.username} value="delete" onClick={this.handleMemberDelete}/>
          </li>)
      }
    });
    console.log(this.state.groupMembers);
    return (
      <div>
        <h2>groupname :</h2>
          <input
            type="text" className="editGroupName" placeholder={this.state.groupName}
            onChange={this.handleGroup}/>
        <br />
        <br />
        <h2>groupmember :</h2>
          Add groupmember : <input
            type="text" className="editGroupMember" palceholder='ex) wnghee91@gmail.com'
            onKeyPress={this.handleKeyPress} onChange={this.handleGroup} />
        <input type="submit" value="add" onClick={this.handleGroupMember} />
        {this.state.errorMemberDuplicate}
        <br />
        <ul>
          {members}
        </ul>
      </div>
    );
  }
}
