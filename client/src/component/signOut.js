import React from 'react';

export default class SignOut extends React.Component {
  handleSignOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    console.log(auth2);
    auth2.signOut().then(() => {
      console.log('User signed out.');
    });

    gapi.client.load('plus', 'v1', () => {
      const request = gapi.client.plus.people.get({
        'userId': 'me'
      });
      request.execute((resp) => {
       console.log('Retrieved profile for:' + resp.displayName, resp);
      });
    });
  }
  render() {
    return (
      <div>
        <input type="button" value="logout" onClick={this.handleSignOut} />
      </div>
    )
  }
}
