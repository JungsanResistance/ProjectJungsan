import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import RenderMembers from './func/renderMember';
import Navbar from './func/navbar';

const Loader = require('react-loader');

export default class GroupPage extends React.Component {
  constructor() {
    super();
    this.state = {
      myGroupList: [],
      adminData: [],
      loaded: false,
    };
  }

  componentWillMount() {
    // get all group-member pair data
    const pairGroupMember = axios.get(`http://ec2-52-78-69-252.ap-northeast-2.compute.amazonaws.com:3000/api/transaction?type=post`);
    // get isadmin data for each groupData
    const adminData = axios.get(`http://ec2-52-78-69-252.ap-northeast-2.compute.amazonaws.com:3000/api/mypage`);
    console.log('we get here')
    Promise.all([pairGroupMember, adminData])
    .then((res) => {
      console.log('hahahahahha', res)
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
    })
    .then(() => {
      this.setState({
        loaded: true,
      });
    });
  }

  render() {
    let editButton;
    // groupList.push()
    const groupNameTab = [];
    console.log('adminData',this.state.adminData)
    this.state.myGroupList.forEach((groupname, index) => {
      // this.state.adminData.forEach((group) => {
      //   if (group.groupname === groupname) {
      //     if (group.isadmin) {
      //       editButton = <Link to={"groupeditform/"+groupname}><button className="btn btn-outline-primary" type="button">그룹정보수정</button></Link>;
      //       return;
      //     }
      //     else {
      //       editButton = '';
      //       return;
      //     }
      //   }
      // });
      if (index === 0) {
        groupNameTab.push(
          <li className="nav-item">
          <a className="nav-link active" data-toggle="tab" href={"#"+this.state.myGroupList[0]} role="tab"><h3>{groupname}</h3></a>
        </li>
      );
      } else {
        groupNameTab.push(
          // <div className="mygroupTab">
            <li className="nav-item">
              <a className="nav-link" data-toggle="tab" href={"#"+groupname} role="tab">{groupname}</a>
            </li>
        )
      }
    });

    groupNameTab[0] =
    <li className="nav-item">
      <a className="nav-link active" data-toggle="tab" href={"#"+this.state.myGroupList[0]} role="tab">{this.state.myGroupList[0]}</a>
    </li>;

    console.log('groupNameTab',groupNameTab)

    const groupMemberTab = [];

    this.state.myGroupList.forEach((groupname, index) => {
      this.state.adminData.forEach((group) => {
        if (group.groupname === groupname) {
          if (group.isadmin) {
            editButton = <Link to={"groupeditform/"+groupname}><button className="btn btn-outline-primary" type="button">그룹정보수정</button></Link>;
            return;
          } else {
            editButton = '';
            return;
          }
        }
      });
      if (index === 0) {
        groupMemberTab.push(
        <div className="tab-pane active" id={groupname} role="tabpanel">
          <RenderMembers groupname={groupname} />
        <br />
        <div>
        <center className="editButton">{editButton}</center>
        </div>
        </div>
        )
      }
      else {
        groupMemberTab.push(
          <div className="tab-pane" id={groupname} role="tabpanel">
            <RenderMembers groupname={groupname} />
            <br />
          <div>
          <center className="editButton">{editButton}</center>
          </div>
          </div>
        );
      }
    });

    console.log("groupMemberTab", groupMemberTab)
    // console.log(groupMemberTab[0].props);
    //
    // console.log(this.state.myGroupList[0])

    // groupMemberTab[0] =
    // <div className="tab-pane" id={groupname} role="tabpanel"><RenderMembers groupname={groupname} /></div>



    return (
      <div>
        <Navbar />
        <Loader loaded={this.state.loaded}>
        <div className="container">
            <div className="col-md-1"></div>
          <div className="col-md-10">
            <header className="jumbotron Mygroup">
                <center><h2 className="groupageHeaderText"> 그룹 정산은 'n분의 일'에서!</h2></center>
              <br />
            <br />
          <Link to="group">
            <p>
              <center>
                <a className="btn grouppageHeaderButton">그룹 추가</a>
              </center>
            </p>
          </Link>
            </header>
            <hr className="grouppageLine"/>
            <br/>
          {/* <center><h3 className="groupListName">내 그룹</h3></center> */}
            <ul className="nav nav-tabs" role="tablist">
          {groupNameTab}
            </ul>
            <div className="tab-content">
                {groupMemberTab}
                  <br />
                </div>
                  <div className="container">
                  </div>
          </div>
            <div className="col-md-1"></div>
        </div>
        </Loader>
      </div>
    );
  }
}
