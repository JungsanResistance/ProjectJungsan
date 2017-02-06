import React from 'react';
import ReactDOM from 'react-dom';
import Landing from './component/landing';
import History from './component/history';
import Newevent from './component/newEvent/NewEvent';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import GoogleLogin from 'react-google-login';
import SignOut from './component/signOut';

const responseGoogle = (response) => {
  // console.log(response);
  console.log(response.profileObj);
  gapi.client.load('plus','v1', function(){
    var request = gapi.client.plus.people.get({
     'userId': 'me'
    });
    request.execute(function(resp) {
     console.log('Retrieved profile for:' + resp.displayName, resp);
    });
  });

}

ReactDOM.render(
  <div>
  <Router history = {browserHistory}>
    <Route path = "/">
        <IndexRoute component = {Landing} />
        <Route path = "history" component = {History} />
        <Route path = "transaction" component = {Newevent} />
      </Route>
      </Router>
    <GoogleLogin
      clientId="142857477193-6pei87bv7g2i1m0il4plcf4t7ebpmvq9.apps.googleusercontent.com"
      buttonText="Login"

      onSuccess={responseGoogle}
      onFailure={responseGoogle}
    />
    <SignOut />
    </div>,
 document.getElementById('app'));
