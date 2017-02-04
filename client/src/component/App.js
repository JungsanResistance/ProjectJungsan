import React from 'react';
import History from './history';
import NewEvent from './newEvent/NewEvent';
import Landing from './landing';
import axios from 'axios';

export default class App extends React.Component {
  constructor() {
     super();
     this.state = {
       groupList: [],
       myTransaction: []
     }
   }

  componentWillMount() {

    axios.get('http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/api/')
    .then(res => {
      const getData = JSON.parse(res.data);
      // console.log('getData', getData)

      const groupStorage = [];
      getData.groupList.forEach((group) => {
        groupStorage.push(group.groupname);
      })

      // const transactionStorage = [];
      // getData.sumList.forEach((sum) => {
      //   transactionStorage.push(sum);
      // })

      this.setState({
         groupList: groupStorage,
         myTransaction: getData.sumList
       })
    })
    // .catch(err => {
    //   console.log('err', err)
    // })
  }

render() {
    return(
      <div>
        <Landing groupList={this.state.groupList} sumList={this.state.myTransaction}/>
        <br /> <br />
        <History />
        <br /> <br />
        <NewEvent />
      </div>
    )
  }
}
