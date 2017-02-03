import React from 'react';
import EventForm from './EventForm';

export default class NewEvent extends React.Component {
  render () {
    return(
      <div className="addEvent">
        <EventForm />
      </div>
    )
  }
}
