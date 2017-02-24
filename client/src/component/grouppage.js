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
    const pairGroupMember = axios.get(`https://oneovern.com/api/transaction?type=post`);
    // get isadmin data for each groupData
    const adminData = axios.get(`https://oneovern.com/api/mypage`);

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
    const groupList = this.state.myGroupList.map((groupname,index) => {
      this.state.adminData.forEach((group) => {
        if (group.groupname === groupname) {
          if (group.isadmin) {
            editButton = '';
            return;
          } else {
            editButton = <button className="btn btn-outline-primary" type="button">그룹정보수정</button>;
            return;
          }
        }
      });
      return (
        <div className="mygroupTable">
        <tr>
          <h3>{groupname}</h3>
          <RenderMembers groupname={groupname} />
          <p>{editButton}</p>
        </tr>
      </div>
      )
    });

    // const groupTable =

    return (
      <div>

        <div className="container">
            <div className="col-md-1"></div>
          <div className="col-md-10">
            <header className="jumbotron Mygroup">
                <center><h2 className="groupageHeaderText"> 우리 그룹 정산은 'n분의 일'에서!</h2></center>
              <br />
            <br />
            <p><center><a className="btn grouppageHeaderButton">그룹 추가</a></center>
                </p>
            </header>

            <hr className="grouppageLine"/>
          {/* <h2><b>내 그룹 모음</b></h2> */}
            {/* <hr /> */}
          <br/>
          <br/>


          {groupList}


            </div>
            <div className="col-md-1"></div>

        </div>

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
