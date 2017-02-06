import React from 'react';

export default class SignOut extends React.Component {
  handleSignOut () {
    var auth2 = gapi.auth2.getAuthInstance();
    console.log(auth2);
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
    
    gapi.client.load('plus','v1', function(){
      var request = gapi.client.plus.people.get({
       'userId': 'me'
      });
      request.execute(function(resp) {
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
