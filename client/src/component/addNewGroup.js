import React from 'react';
import axios from 'axios';
import Router, { browserHistory } from 'react-router';
import Navbar from './func/navbar';

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
    axios.get('https://oneovern.com/api/misc')
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
        errorGroupnameDuplicate: '그룹 이름을 넣어주세요'
      })
    }
    else {
      console.log("groupname::",this.state.groupname,
      "groupmembers::::", this.state.groupmembers);
      axios.post('https://oneovern.com/api/group', {
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
    if (event.target.className === 'form-control inputGroupName') {
      console.log(event.target.value)
      this.setState({
        groupname: event.target.value,
        errorGroupnameDuplicate: '',
      });
    }
    else if (event.target.className === 'form-control addGroupMembers') {
      console.log(event.target.value);

      this.setState({
        emailToBeChecked: event.target.value,
      });
    }
  }

  handleAddMember() {
    document.body.getElementsByClassName('form-control addGroupMembers')[0].value = '';
    axios.get(`https://oneovern.com/api/groupedit?target=email&email=${this.state.emailToBeChecked}`)
    .then((res) => {
      console.log(res.data);
      const data = JSON.parse(res.data);
      if (data.length) {
        const nextGroupmembers = this.state.groupmembers.slice();
        const duplicateEmailCheck = this.state.groupmembers.some((item) => {
          return item.email === data[0].email;
        });

        console.log("duplicateEmailCheck", duplicateEmailCheck)
        if (duplicateEmailCheck) {
          this.setState({
            errorMemberDuplicate: '이미 추가된 멤버입니다',
          });
        } else {
          console.log(nextGroupmembers)
          nextGroupmembers.push({
            username: data[0].username,
            email: data[0].email,
          });
          this.setState({
            groupmembers: nextGroupmembers,
            errorMemberDuplicate: '',
          });
        }
      } else {
        this.setState({
          errorMemberDuplicate: '등록된 email이 없습니다.',
        });
      }
    });
  }

  handleKeyPress(event) {
    if (event.charCode === 13) {
      if (event.target.className === 'form-control addGroupMembers') {
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
      axios.get(`https://oneovern.com/api/groupedit?target=groupname&groupname=${this.state.groupname}`)
      .then((res) => {
        const data = JSON.parse(res.data);
        if (data.length) {
          this.setState({
            errorGroupnameDuplicate: '중복된 그룹 이름입니다',
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
    console.log(this.state.groupmembers)
    const groupMembers = this.state.groupmembers.map((data, index) => {
      console.log(data)
      if (index !==0) {
        return (
        <tr>
          <td>{data.username}</td>
          <td>{data.email}</td>
          <td><input
            type="submit" value="delete" name={data.email}
            onClick={this.handleMemberDelete} />
          </td>
        </tr>);
      }
      else {
        return (
          <tr>
            <td>{data.username}</td>
            <td>{data.email}</td>
            <td>그룹장</td>
          </tr>);
      }
    });

    return (
      <div>
        <Navbar />
        <br />
        <br />
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-3"></div>
              <div className="col-md-6">
                <div className="newGroupFormBox">
                  <div className="newGroupFormTop">
                    <div className="form-top-left">
                      <h3>새로운 그룹을 만들어보세요!</h3>
                    <p><h4>그룹원들과의 정산을 쉽고 편리하게 할 수 있습니다.</h4></p>
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
                          {groupMembers}
                        </table>
                      </div>


                    </form>
                    <div className="form-footer">
                      <button type="button" className="btn submitNewGroup" value="이벤트 등록" onClick={this.handleSubmit}><b>이벤트 등록</b></button>
                    </div>
                  </div>
                  {this.state.submitMessage}
                </div>
                </div>
                <div className="col-sm-3"></div>
              </div>
          </div>
      </div>
    );
  }

}
