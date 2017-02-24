import React from 'react';
import axios from 'axios';
import Router, { browserHistory } from 'react-router'
import Navbar from './func/navbar';

export default class GroupEditForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
    axios.get(`https://oneovern.com/api/groupedit?target=groupmembers&groupname=${this.props.params.groupname}`)
    .then((res) => {
      console.log("res!!!!!!!!!",res)
      const groupData = JSON.parse(res.data);
      const groupMemberData = groupData.map((data) => {
        return {
          groupname: data.groupname,
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
    this.handleGroupName()

    if(this.state.errorGroupnameDuplicate !== '현재 사용하고 있는 그룹이름입니다.' &&
    this.state.errorGroupnameDuplicate !== '이 그룹이름은 이미 있어 띵구야') {
      const groupMemberCheck = JSON.stringify(this.state.newGroupmembers) === JSON.stringify(this.state.oldGroupmembers);
      const groupNameCheck = this.state.newGroupname === this.state.oldGroupname;

      const emptyGroupMembersCheck = this.state.newGroupmembers.every((member) => {
        return member.active === 0;
      });
      // console.log(emptyGroupMembersCheck)
      if (emptyGroupMembersCheck) {
        this.setState({
          errorSubmit: '그룹에는 최소 1명의 멤버가 있어야 합니다',
        });
      }
      else {
        if ((groupNameCheck === false) && groupMemberCheck) {
            axios.put(`https://oneovern.com/api/groupedit`,
              {
                body: {
                  oldgroupname: this.state.oldGroupname,
                  newgroupname: this.state.newGroupname,
                  action: 'modifyGroupName',
                }
              }
            )
            .then((res) => {
              if (res.status === 200){
                  console.log('post response:', res);
                  // this.setState({
                  //   errorSubmit: '그룹이름이 수정되었습니다!',
                  // })
                  alert('그룹 이름이 수정되었습니다')
                  browserHistory.push('/mypage');
                } else {
                  console.log(res.status);
                }
              }
            )
          // }
        }

        else if (groupNameCheck && (groupMemberCheck === false)) {
          axios.put(`https://oneovern.com/api/groupedit`,
             {
               action: 'modifyGroupMembers',
               data: {
                 oldgroupname: this.state.oldGroupname,
                 newgroupname: this.state.newGroupname,
                 groupmembers: this.state.newGroupmembers,
              }
             }
          )
          .then((res) => {
            console.log(res);
            if (res.status === 200){
              // alert('그룹 이름이 수정되었습니다')
              browserHistory.push('/mypage');
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
          axios.put(`https://oneovern.com/api/groupedit`,
             {
               action: 'modifyGroupAll',
               data: {
                 oldgroupname: this.state.oldGroupname,
                 newgroupname: this.state.newGroupname,
                 groupmembers: this.state.newGroupmembers,
              }
            }
          )
          .then((res) => {
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
          alert('수정사항이 없습니다.')
          browserHistory.push('/mypage');
        }
      }
    }
  };

  handleGroup(event) {
    if (event.target.className === 'editGroupName') {
      if (event.target.value.length){
        this.setState({
          newGroupname: event.target.value,
          errorSubmit: '',
          errorGroupnameDuplicate: '',
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
          errorSubmit: '',
        })
    }
  }

  handleAddMember() {
    document.body.getElementsByClassName('editGroupMember')[0].value = '';
    axios.get(`https://oneovern.com/api/groupedit?target=email&email=${this.state.emailToBeChecked}`)
    .then((res) => {
      const data = JSON.parse(res.data);
      const nextGroupmembers = [...this.state.newGroupmembers];
      if (data.length) {
        const duplicateEmailCheck = nextGroupmembers.some((item) => {
          return item.email === data[0].email;
        });
        if (!duplicateEmailCheck) {
          nextGroupmembers.push({
            groupname: data[0].groupname,
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
            nextGroupmembers.forEach((member, index) => {
              if (member.email === data[0].email) {
                memberIndex = index;
              }
          });
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
      if (event.target.className === 'editGroupMember') {
        this.handleAddMember();
      }
      else if (event.target.className === 'editGroupName') {
        this.handleGroupName();
      }
    }
  }

  handleMemberDelete(event) {
    console.log("delete clicked")
    const NextGroupmembers = [...this.state.newGroupmembers];
    NextGroupmembers.map((data) => {
      if (data.username === event.target.name) {
        data.active = 0;
      }
    });
    this.setState({
      newGroupmembers: NextGroupmembers,
      errorMemberDuplicate: '',
      errorSubmit: '',
    });
  }

  handleGroupName() {
    axios.get(`https://oneovern.com/api/groupedit?target=groupname&groupname=${this.state.newGroupname}`)
    .then((res) => {
      const data = JSON.parse(res.data);
      console.log(data.length )
      if (data.length && this.state.newGroupname !== this.props.params.groupname) {
        if (this.state.newGroupname === data[0].groupname) {
          this.setState({
            errorGroupnameDuplicate: '이 그룹이름은 이미 있어 띵구야',
            groupDuplicateFlag: "errorMemberDuplicateFalse",
          })
        }
      }
      else {
        this.setState({
          groupname: this.state.newGroupname,
          errorGroupnameDuplicate: '사용할 수 있는 이름이군요!',
          groupDuplicateFlag: "errorMemberDuplicateTrue",
        })
      }
    });
  }

  render() {
    // const members = [];
    // this.state.newGroupmembers.forEach((member) => {
    //   if (member.active) {
    //     members.push(
    //       <li>
    //         {member.username} ({member.email})
    //         <input
    //         type="button" name={member.username} value="delete" onClick={this.handleMemberDelete}/>
    //       </li>)
    //   }
    // });

    console.log('this.state.newGroupmembers',this.state.newGroupmembers)

    const members = this.state.newGroupmembers.map((member, index) => {
      if(index !==0 ) {
        return (
        <tr>
          <td>{member.username}</td>
          <td>{member.email}</td>
          <td><input
            type="submit" value="delete" name={member.email}
            onClick={this.handleMemberDelete} />
          </td>
        </tr>);
      }
      else {
        return (
          <tr>
            <td>{member.username}</td>
            <td>{member.email}</td>
            <td>그룹장</td>
          </tr>);
      }
    });

    console.log('members',members)

    return (
      <div>
        <Navbar />
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
        <input type="button" value="그룹수정" onClick={this.handleSubmitGroup} />
        <br />
        <br />
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-3"></div>
              <div className="col-md-6">
                <div className="newGroupFormBox">
                  <div className="newGroupFormTop">
                    <div className="form-top-left">
                      <h3>그룹명과 그룹멤버를 수정해보세요!</h3>
                    <p><h4>내용을 수정한 후에 그룹수정버튼을 눌러주세요.</h4></p>
                    </div>
                    <div className="form-top-right">
                      <div className="icon-user">
                        <b><span className="glyphicon glyphicon-user">
                        </span></b>
                      </div>
                    </div>
                  </div>
                  <div className="newGroupFormBottom">
                    <form className="newEventForm">
                      <div className="form-group">
                        <input
                          type="text" className="form-control inputGroupName" placeholder="그룹이름을 적어주세요."
                          onChange={this.handleInput} onKeyPress={this.handleKeyPress} />
                        <button type="button" className="btn duplicateGroupnameCheck" onClick={this.handleGroupName}>중복확인</button>
                        <p className={this.state.groupDuplicateFlag}>{this.state.errorGroupnameDuplicate} </p>
                      </div>
                      <div className="form-group">
                        <input
                          type="text" className="form-control addGroupMembers" placeholder="그룹원의 이메일을 적어주세요. ex) wnghee91@gmail.com"
                          onChange={this.handleInput} onKeyPress={this.handleKeyPress} />
                        <button type="button" className="btn addGroupMember" onClick={this.handleAddMember} >그룹원 추가</button>
                        <p className="errorMemberDuplicateFalse">{this.state.errorMemberDuplicate} </p>
                      </div>
                      <div className="form-group">
                        <table className="table table-hover memberSelect">
                          <thead>
                            <tr>
                              <th>이름</th>
                            <th>이메일</th>
                          <th>비고</th>
                            </tr>
                          </thead>
                          {members}
                        </table>
                      </div>
                    </form>
                    <div className="form-footer">
                      <button type="button" className="btn submitNewGroup" value="그룹수정" onClick={this.handleSubmitGroup}><b>그룹수정</b></button>

                    </div>
                  </div>
                  {this.state.errorSubmit}
                </div>
                </div>
                <div className="col-sm-3"></div>
              </div>
          </div>
      </div>
    );
  }
}
