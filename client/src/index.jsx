import React from 'react';
import ReactDOM from 'react-dom';
import Landing from './component/landing';
import History from './component/history';
import Mypage from './component/mypage';
import Newevent from './component/newEvent/NewEvent';
import AddNewGroup from './component/addNewGroup';
import GroupPage from './component/grouppage';
import GroupEditForm from './component/groupEditForm';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/">
      <IndexRoute component={Landing} />
      <Route path="mypage" component={Mypage} />
      <Route path="history" component={History} />
      <Route path="transaction" component={Newevent} />
      <Route path="group" component={AddNewGroup} />
      <Route path="groupeditform" component={GroupEditForm} />
      <Route path="grouppage/:groupname" component={GroupPage} />
    </Route>
  </Router>,
 document.getElementById('app'));
