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
    axios.get(`http://localhost:3000/api/group?target=groupmembers&groupname=${this.props.groupname}`)
    .then((res) => {
      if(res.status === 200) {
      const groupData = JSON.parse(res.data);
      console.log(groupData)
      }
    })
  }


  render() {


    return (
      <li>Test</li>
    )
  }
}
