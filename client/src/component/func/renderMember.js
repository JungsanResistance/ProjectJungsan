import React from 'react';
import axios from 'axios';


export default class RenderMembers extends React.Component {
  constructor(){
    super();
    this.state = {
      groupmemberList : [],
    }
  }

  componentWillMount() {
    console.log("groupname:", this.props.groupname)
    axios.get(`http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com/api/group?target=groupmembers&groupname=${this.props.groupname}`)
    .then((res) => {
      if (res.status === 200) {
      const groupData = JSON.parse(res.data);
      console.log(groupData)
      this.setState({
        groupmemberList: groupData,
      });
      }
    })
  }


  render() {
    console.log(this.state.groupmemberList);
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
