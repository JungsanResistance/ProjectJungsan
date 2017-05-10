import React from 'react';
import axios from 'axios';


export default class RenderMembers extends React.Component {
  constructor()  {
    super();
    this.state = {
      groupmemberList: [],
    };
  }

  componentWillMount() {
    axios.get(`http://ec2-52-78-69-252.ap-northeast-2.compute.amazonaws.com:3000/api/group?target=groupmembers&groupname=${this.props.groupname}`)
    .then((res) => {
      if (res.status === 200) {
        const groupData = JSON.parse(res.data);
        this.setState({
          groupmemberList: groupData,
        });
      }
    });
  }

  render() {
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
