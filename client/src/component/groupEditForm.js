import React from 'react';
import axios from 'axios';

export default class GroupEditForm extends React.Component {

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //   };
  // }


  componentWillMount() {
    axios.get('http://localhost:3000/api/group')
    .then((res) => {
      console.log("groupEdit", res);
    });
  }

  render() {

    return(
      <div>

      </div>
    )

  }

}
