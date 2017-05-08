import React from 'react';
import axios from 'axios';


export default class RenderMembers extends React.Component {
  constructor(){
    super();
    this.state = {
      groupmemberList: [],
    };
  }

  componentWillMount() {
    console.log('this.props.groupname', this.props.groupname)
    axios.get(`http://localhost:3000/api/group?target=groupmembers&groupname=${this.props.groupname}`)
    .then((res) => {
      if (res.status === 200) {
        console.log('res.data',res.data)
      const groupData = JSON.parse(res.data);
      console.log(groupData)
      this.setState({
        groupmemberList: groupData,
      });
      }
    });
  }

  render() {
    console.log('this.state.groupmemberList', this.state.groupmemberList)
    const members = this.state.groupmemberList.map((member, index) => {
      if (member.active) {
        return (
        <tr>
        <th>{index}</th>
        <td>{member.username}</td>
        <td>({member.email})</td>
        </tr>);
      }
    });
    console.log('members',members)
    return (
      <div>
        <table className="table groupPageTable">
          <thead className="groupPageTableHead">
            <th>#</th>
            <th>이름</th>
            <th>이메일</th>
          </thead>
          <tbody>
            {members}
          </tbody>
        </table>
      </div>
    );
  }
}
