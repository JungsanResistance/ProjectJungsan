import React from 'react';
import moment from 'moment';

const url = 'http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000/';

export default class EventForm extends React.Component {
  constructor(){
    super();
    this.state = {
      members:['no group selected']
    }

    this.selectGroup=this.selectGroup.bind(this);
  }


  selectGroup (e) {

    const info = [{
      group : 'codestates',
      members : ['ilmo', 'woonghee', 'sanghun']
    },
    {
      group : 'peachtree',
      members : ['woonghee','minho','bu']
    }];

    e.preventDefault();
    const group = document.getElementsByClassName('groupSelect')[0].value;
    console.log(group)
    const selected = info.filter( (data) => {
      return data.group === group
    })
    // console.log(selected[0].members)
    if(selected[0] !== undefined){
      const memebersWithFlag = selected[0].members.map( data => {
        return {name: data, selected:false}
    })
    console.log(memebersWithFlag)

    this.setState({
      members: memebersWithFlag
    })
    } else {
    this.setState({
      members: [{name:'no group selected'}] // this string doesn't show...ㅠ//
    })

    }


  };

  render () {


    const info = [{
      group : 'codestates',
      members : ['ilmo', 'woonghee', 'sanghun']
    },
    {
      group : 'peachtree',
      members : ['woonghee','minho','bu']
    }];

    const groups=[];
    info.forEach( data => {
      groups.push(<option value={data.group}>{data.group}</option>);
    })

    const members=[];
    this.state.members.forEach( data=> {
      members.push(<li>{data.name}</li>)
    })

    return(
      <div>

        <form action={url} method="post">

          select your group :
          <select name="eventGroup" className="groupSelect" onChange={this.selectGroup}  >
          <option>선택하시오.</option>
            {groups}
          </select>

          <br />
          <br />
          select members :
          <ul>{members}</ul>

          select the event date :
          <p>
          <input name="eventDate" className="inputDate" type="date" value={moment().format('YYYY-MM-DD')} />
          </p>

          total event cost :
          <input name="eventCost" className="inputEventCost" type="number" />

          <br />
          <br />
          <input type="submit" value="submit"/>

        </form>

      </div>
    )

  }


}
