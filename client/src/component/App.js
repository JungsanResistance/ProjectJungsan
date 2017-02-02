import React from 'react';
import History from './history';
import NewEvent from './newEvent/NewEvent';

export default class App extends React.Component {

  render() {
    return(
      <div>
        <History />
        <br /> <br />
        <NewEvent />
      </div>
    )
  }
}
