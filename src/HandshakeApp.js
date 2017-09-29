import React, { Component } from 'react'
import Handshake from './contracts/Handshake.json'
import getWeb3 from './utils/getWeb3';
import Dashboard from './Dashboard';
import NewContract from './NewContract';
import Identity from './Identity';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';


class HandshakeApp extends Component {

  constructor(props){
    super(props);

    this.appContext = {
      web3: null,
      handshakeContractInstance: null,
      userAccount: null
    };

    this.state = {
      contracts: [
        {
          name: 'Home caretaker for elderly home',
          site: 'Hospital 7, Saudi Arabia',
          type: 'Caretaker',
          status: 'Unsigned'
        } // TODO: Remove this once data is real
      ]
    }
  }

  componentWillMount(){
    getWeb3
    .then(results => {
      this.appContext.web3 = results.web3;
      this.setupContractInstance();
    })
    .catch((e) => {
      console.log('Error finding web3.', e)
    })
  }

  setupContractInstance(){
    const contract = require('truffle-contract')
    const handshake = contract(Handshake)
    handshake.setProvider(this.appContext.web3.currentProvider)
    this.appContext.web3.eth.getAccounts((error, accounts) => {
      this.appContext.userAccount = accounts[0];
      handshake.deployed().then((instance) =>{
          this.appContext.handshakeContractInstance = instance;
          this.setupContractListeners(this);
          this.registerAgency();
      });
    });
  }

  setupContractListeners(component){
    this.appContext.handshakeContractInstance
    .LogLaborContractCreated(null, { fromBlock: 0, toBlock: 'latest' }).watch(function(err, result){
      if (err) {
        console.log(err);
        return;
      }
      console.log('contract created from: ', result.args.agency);
      console.log('contract at address: ', result.args.atAddress);
      console.log('contract created with data: ', result.args.data);
      component.setState({
        contracts: component.state.contracts.concat([JSON.parse(result.args.data)])
      });
    })
  }

  // Register current user as agency if not already registered. Can improve in future
  registerAgency(){
    this.appContext.handshakeContractInstance
    .isRegistered.call(this.appContext.userAccount)
    .then(registered =>{
      if (!registered)
        this.appContext.handshakeContractInstance
          .registerAgency(this.appContext.userAccount, {from: this.appContext.userAccount});
    });
  }

  render(){
    return(
      <div>
        <Router>
          <Switch>
            <Route exact path='/' render={() => <Dashboard contracts={this.state.contracts}/>}/>
            <Route exact path='/contract/new' render={() => <NewContract appContext={this.appContext} />} />
            <Route exact path='/identity' component={Identity}/>
          </Switch>
        </Router>
      </div>
    );
  }

}

export default HandshakeApp
