import React from 'react';
import ReactDOM from 'react-dom';
import Landing from './component/landing';
import History from './component/history';
import Mypage from './component/mypage';
import NewEvent from './component/newEvent';
import AddNewGroup from './component/addNewGroup';
import GroupPage from './component/grouppage';
import GroupEditForm from './component/groupEditForm';
import EditEvent from './component/editEvent';
import Eventinfo from './component/eventInfo';
import FailedRedirect from './component/func/failedRedirect';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/">
      <IndexRoute component={Landing} />
      <Route path="mypage" component={Mypage} />
      <Route path="history" component={History} />
      <Route path="transaction" component={NewEvent} />
      <Route path="group" component={AddNewGroup} />
      <Route path="groupeditform/:groupname" component={GroupEditForm} />
      <Route path="grouppage" component={GroupPage} />
      <Route path="eventinfo/:eventInfo" component={Eventinfo} />
      <Route path="eventedit/:eventInfo" component={EditEvent} />
      <Route path="failed" component={FailedRedirect} />
    </Route>
  </Router>,
 document.getElementById('app'));
