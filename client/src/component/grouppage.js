import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import RenderMembers from './func/renderMember';

export default class GroupPage extends React.Component {
  constructor() {
    super();
    this.state = {
      myGroupList: [],
    };
  }

  componentWillMount() {
    axios.get(`https://oneovern.com/api/mypage`)
    .then((res) => {
      const allData = JSON.parse(res.data).groupList;
      this.setState({
        myGroupList: allData,
      });
    });
  }

  render() {
    let editButton;
    this.state.myGroupList.forEach((myGroup) => {
      if (myGroup.groupname === this.props.params.groupname) {
        if (!myGroup.isadmin) {
          editButton = '';
        } else {
          editButton = <input type="submit" value="edit" />;
        }
      }
    });

    return (
      <div>
        <h1>
        {this.props.params.groupname}
        </h1>
        <br />
        <RenderMembers groupname={this.props.params.groupname} />
        <br />
        <br />
        <Link to={'groupeditform/'+ this.props.params.groupname}>
        {editButton}
        </Link>
      </div>
    );
  }
}
