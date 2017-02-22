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
    axios.get(`https://oneovern.com/api/group?target=groupmembers&groupname=${this.props.groupname}`)
    .then((res) => {
      if (res.status === 200) {
      const groupData = JSON.parse(res.data);
      console.log(groupData)
      this.setState({
        groupmemberList: groupData,
      });
      }
    });
  }

  render() {
    const members = this.state.groupmemberList.map((member) => {
      if (member.active) {
        return <li>{member.username} ({member.email})</li>
      }
    });
    return (
      <div>
        <ul>
          {members}
        </ul>
      </div>
    );
  }
}
