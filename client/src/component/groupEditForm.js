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
      errorSubmit: '',
      groupDuplicateFlag: '',
    };
    this.handleAddMember = this.handleAddMember.bind(this);
    this.handleGroup = this.handleGroup.bind(this);
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
      this.setState({
        newGroupmembers: groupMemberData.map(groupMember => Object.assign({}, groupMember)),
        oldGroupmembers: groupMemberData.map(groupMember => Object.assign({}, groupMember)),
      });
    });
  }

  handleSubmitGroup() {

    const groupMemberCheck = JSON.stringify(this.state.newGroupmembers) === JSON.stringify(this.state.oldGroupmembers);
    const groupNameCheck = this.state.newGroupname === this.state.oldGroupname;

    console.log(this.state.newGroupname)
    if ((groupNameCheck === false) && groupMemberCheck) {
        console.log('here : modifyGroupName')
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
          console.log('modifyGroupName::',res.status);
          if(res.status === 200){
            this.setState({
              errorSubmit: '그룹이름이 수정되었습니다!',
            })
          } else {
            this.setState({
              errorSubmit: '에러..!? 운영자에게 연락주세요 ㅠㅠ',
            })
          }
        })
      // }
    }
    else if (groupNameCheck && (groupMemberCheck === false)) {
      console.log('here : modifyGroupMembers')
      axios.put(`http://localhost:3000/api/groupedit`,
         {
           action: 'modifyGroupMembers',
           data: {
             oldGroupname: this.state.oldGroupname,
             newGroupname: this.state.newGroupname,
             groupmembers: this.state.newGroupmembers,
          }
         }
      )
      .then((res) => {
        console.log('modifyGroupMembers::',res);
        if(res.status === 200){
          this.setState({
            errorSubmit: '그룹멤버가 수정되었습니다!',
          })
        } else {
          this.setState({
            errorSubmit: '에러..!? 운영자에게 연락주세요 ㅠㅠ',
          })
        }
      });
    }
    else if ((groupNameCheck || groupMemberCheck) === false) {
      console.log('here : modifyGroupAll')
      axios.put(`http://localhost:3000/api/groupedit`,
         {
           action: 'modifyGroupAll',
           data: {
             oldGroupname: this.state.oldGroupname,
             newGroupname: this.state.newGroupname,
             groupmembers: this.state.newGroupmembers,
          }
        }
      )
      .then((res) => {
        console.log('modifyGroupAll::',res);
        if(res.status === 200){
          this.setState({
            errorSubmit: '그룹멤버와 그룹이름이 수정되었습니다',
          })
        } else {
          this.setState({
            errorSubmit: '에러..!? 운영자에게 연락주세요 ㅠㅠ',
          })
        }
      });
    }
    else {
      console.log("modify...??")
      this.setState({
        errorSubmit: '수정한다면서요...!?',
      })
    }
  };

  handleGroup(event) {
    if (event.target.className === 'editGroupName') {
      if(event.target.value.length){
        this.setState({
          newGroupname: event.target.value,
        })
      } else {
        this.setState({
          newGroupname: this.props.params.groupname,
        });
      }
    }
    else if (event.target.className === 'editGroupMember') {
        this.setState({
          emailToBeChecked: event.target.value,
          errorMemberDuplicate: '',
        })
    }
  }

  handleAddMember() {
    document.body.getElementsByClassName('editGroupMember')[0].value = '';
    axios.get(`http://localhost:3000/api/groupedit?target=email&email=${this.state.emailToBeChecked}`)
    .then((res) => {
      const data = JSON.parse(res.data);
      console.log("here:::", data);
      const nextGroupmembers = [...this.state.newGroupmembers];

      if (data.length) {

        const duplicateEmailCheck = nextGroupmembers.some((item) => {
          return item.email === data[0].email;
        });
        console.log(duplicateEmailCheck)
        if (!duplicateEmailCheck) {
          nextGroupmembers.push({
            username: data[0].username,
            email: data[0].email,
            active: 1,
          });
          this.setState({
            newGroupmembers: nextGroupmembers,
            errorMemberDuplicate: '추가되었습니다.',
            emailToBeChecked: '',
          });
        }
        else {
          let memberIndex;
            nextGroupmembers.forEach((member,index) => {
              if(member.email === data[0].email) {
                memberIndex = index;
              }
          });
          console.log(memberIndex)
          if (nextGroupmembers[memberIndex].active) {
            this.setState({
              errorMemberDuplicate: '이미 추가된 멤버입니다!',
              emailToBeChecked: '',
            });
          } else {
            nextGroupmembers[memberIndex].active = 1;
            this.setState({
              newGroupmembers: nextGroupmembers,
              errorMemberDuplicate: '추가되었습니다.',
              emailToBeChecked: '',
            });
          }
        }
      }
      else {
        this.setState({
          errorMemberDuplicate: '등록된 이메일주소가 아닙니다!',
          emailToBeChecked: '',
        });
      }
    });
  }

  handleKeyPress(event) {
    if (event.charCode === 13) {
      console.log(this.state.emailToBeChecked)
      if (event.target.className === 'editGroupMember') {
        this.handleAddMember();
      }
      else if (event.target.className === 'editGroupName') {
        this.handleGroupName();
      }
    }
  }

  handleMemberDelete(event) {
    console.log(this.state.oldGroupmembers)
    const NextGroupmembers = [...this.state.newGroupmembers];
    NextGroupmembers.map((data) => {
      if (data.username === event.target.name) {
        data.active = 0;
      }
    });
    console.log(this.state.oldGroupmembers)
    this.setState({
      newGroupmembers: NextGroupmembers,
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
    this.state.newGroupmembers.forEach((member) => {
      if (member.active) {
        members.push(
          <li>
            {member.username} ({member.email})
            <input
            type="button" name={member.username} value="delete" onClick={this.handleMemberDelete}/>
          </li>)
      }
    });

    return (
      <div>
        <h2>groupname :</h2>
          <input
            type="text" className="editGroupName" placeholder={this.state.oldGroupname}
            onChange={this.handleGroup} onKeyPress={this.handleKeyPress}/>
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
        <br />
        <br />
        {this.state.errorSubmit}
      </div>
    );
  }
}
