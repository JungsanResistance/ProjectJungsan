import React from 'react';

export default class Landing extends React.Component {
  render () {

    const List = [];
    this.props.sumList.forEach((data) => {
      List.push(
        <tr>
          <td>{data.username}</td>
          <td>{data.cost}</td>
        </tr>
      );
    })

    return (
      <div>
        <h1>my Page</h1>
        <table className="groupList">
          <tr>
            <th>name</th>
            <th>cost</th>
          </tr>
          {List}
        </table>

        <h1>Group List</h1>
        {this.props.groupList}
      </div>
    )
  }
}
