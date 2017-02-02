import React from 'react';

export default class History extends React.Component {

  constructor(){
    super()

  }

  render() {

    const info = [{
      group : 'codestates',
      ename : 'lunch',
      date : '2017-02-02',
      subject : 'ilmo',
      cost : 2000
    },
    {
      group : 'codestates',
      ename : 'dinner',
      date : '2017-02-03',
      subject : 'woong',
      cost : 3000
    },
    {
      group : 'peachtree',
      ename : 'lunch',
      date : '2017-02-04',
      subject : 'sanghun',
      cost : 100000
    },
    {
      group : 'peachtree',
      ename : 'dinner',
      date : '2017-02-13',
      subject : 'minho',
      cost : -3000
    },
  ]

  const result = [];
  info.forEach( (data,index) => {
    result.push(
      <tr>
        <td>{data.group}</td>
        <td>{data.ename}</td>
        <td>{data.date}</td>
        <td>{data.subject}</td>
        <td>{data.cost}</td>
      </tr>)
  })

    return (
      // <div>

        // <table>
        //   <tr>
        //     <th>group</th>
        //     <th>event name</th>
        //     <th>date</th>
        //     <th>subject</th>
        //     <th>cost</th>
        //   <tr/>
        // {result}
        // </table>
      // </div>

      <div className="historyTable">
        <table className="table">
          <tr>
            <th>group</th>
            <th>eventname</th>
            <th>date</th>
            <th>subject</th>
            <th>cost</th>
          </tr>
          {result}
        </table>
      </div>

    )
  }
};
