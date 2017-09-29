import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import Handshake from './contracts/Handshake.json'
import getWeb3 from './utils/getWeb3';
import CommentBox from './CommentBox';
import Contracts from './Contracts';
import Dashboard from './Dashboard';
import Header from './Header';
import NewContract from './NewContract';
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
} from 'react-router-dom';


class HandshakeApp extends Component {

  constructor(props){
    super(props);

    this.appContext = {
      web3: null,
      handshakeContractInstance: null
    };
  }

  componentWillMount(){
    getWeb3
    .then(results => {
      this.appContext.web3 = results.web3;
      this.setupContractInstance();
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  setupContractInstance(){
    const contract = require('truffle-contract')
    const handshake = contract(Handshake)
    handshake.setProvider(this.appContext.web3.currentProvider)
    handshake.deployed()
      .then(instance => this.appContext.handshakeContractInstance = instance);
  }

  render(){
    return(
      <div>
        <Header />

        <Router>
          <Switch>
            <Route exact path='/' component={Dashboard}/>
            <Route exact path='/contract/new' component={NewContract}/>
          </Switch>
        </Router>
      </div>
    );
  }

}

export default HandshakeApp
