import React from 'react';
import { Link } from 'react-router';

export default class GroupPage extends React.Component {

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //   };
  // }

  render() {
    return (
      <div>
        {this.props.params.groupname}
        <br />
        <br />
      <Link to={'groupeditform/'+ this.props.params.groupname}>
        <input type="submit" value="edit" />
      </Link>
      </div>
    );
  }
}
