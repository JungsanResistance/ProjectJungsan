import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import RenderMembers from './func/renderMember';

export default class GroupPage extends React.Component {
  constructor() {
    super();
    this.state = {
      myGroupList: [],
      adminData: [],
    };
  }

  componentWillMount() {


    // get all group-member pair data
    const pairGroupMember = axios.get(`http://localhost:3000/api/transaction?type=post`);
    // get isadmin data for each groupData
    const adminData = axios.get(`http://localhost:3000/api/mypage`);

    Promise.all([pairGroupMember, adminData])
    .then((res) => {
      console.log(res)
      const getGroupMemberData = JSON.parse(res[0].data);
      const getGroupAdminInfo = JSON.parse(res[1].data).groupList;
      console.log('getGroupAdminInfo', getGroupAdminInfo);

      // manipulate and create {groupname: [member1, member2, ...]}
      const groupStorage = {};
      getGroupMemberData.forEach((item) => {
        groupStorage[item.groupname] = [];
      });
      getGroupMemberData.forEach((item) => {
        groupStorage[item.groupname].push({
          username: item.username,
          email: item.email,
        });
      });

      const groupList = [];
      for(let key in groupStorage) {
        groupList.push(key);
      }


      this.setState({
        myGroupList: groupList,
        adminData: getGroupAdminInfo,
      });
    });
  }

  render() {

    // let editButton;
    // this.state.myGroupList.forEach((myGroup) => {
    //   if (myGroup.groupname === this.props.params.groupname) {
    //     if (!myGroup.isadmin) {
    //       editButton = '';
    //     } else {
    //       editButton = <input type="submit" value="edit" />;
    //     }
    //   }
    // });

    let editButton;
    const groupList = this.state.myGroupList.map((groupname) => {
      this.state.adminData.forEach((group) => {
        if (group.groupname === groupname) {
          if (group.isadmin) {
            editButton = '';
            return;
          } else {
            editButton = <Link to={'groupeditform/' + groupname}>그룹수정</Link>;
            return;
          }
        }
      });

      return (
        <div>
          <li>{groupname}</li>
          <RenderMembers groupname={groupname} />
          <p>{editButton}</p>
        </div>
      );
    });

    return (
      <div>
        <ul>
          groupList
          {groupList}
        </ul>
        {/* <h1>
        {this.props.params.groupname}
        </h1>
        <br />
        <RenderMembers groupname={this.props.params.groupname} />
        <br />
        <br />
        <Link to={'groupeditform/'+ this.props.params.groupname}>
        {editButton}
        </Link> */}
      </div>
    );
  }
}
