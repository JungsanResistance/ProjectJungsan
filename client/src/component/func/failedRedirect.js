import React from 'react';
import Router, { browserHistory } from 'react-router';

export default class FailedRedirect extends React.Component {


  componentWillMount() {
    alert('이미 가입된 email 입니다. Login 해 주세요');
    browserHistory.push('http://localhost:3000/');
  }
  render() {
    return (
      <div></div>
    );
  }
}
