import React from 'react';

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
    const selected = info.filter( (data) => {
      return data.group === group
    })
    console.log(selected[0])

    this.setState({
      members:selected[0].members
    })

  }

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
      members.push(<li>{data}</li>)
    })

    return(
      <div className="EventForm">

        select your group :
        <select className="groupSelect" onChange={this.selectGroup}  >
           {groups}
        </select>

        <br />
        <br />
        select members :
        <ul>{members}</ul>
      </div>
    )

  }


}
