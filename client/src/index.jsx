import React from 'react';
import ReactDOM from 'react-dom';
import Landing from './component/landing';
import History from './component/history';
import Mypage from './component/mypage';
import NewTransaction from './component/newTransaction';
import AddNewGroup from './component/addNewGroup';
import GroupPage from './component/grouppage';
import GroupEditForm from './component/groupEditForm';
import EditEvent from './component/editEvent';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/">
      <IndexRoute component={Landing} />
      <Route path="mypage" component={Mypage} />
      <Route path="history" component={History} />
      <Route path="transaction" component={NewTransaction} />
      <Route path="group" component={AddNewGroup} />
      <Route path="groupeditform/:groupname" component={GroupEditForm} />
      <Route path="grouppage/:groupname" component={GroupPage} />
      <Route path="editevent" component={EditEvent} />
    </Route>
  </Router>,
 document.getElementById('app'));
