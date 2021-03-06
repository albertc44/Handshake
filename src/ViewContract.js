import React, { Component } from 'react';
import { MNID } from 'uport-connect'
import style from './style/contracts';
import LaborContract from './contracts/LaborContract.json'

class ViewContract extends Component {

    constructor(props){
      super(props)

      this.state = {
        uPortUser: null,
        signees: []
      };
    }

    componentWillMount(){
      this.setupContractInstance();
    }

    setupContractInstance(){
      const contract = require('truffle-contract')
      const laborContract = contract(LaborContract)
      laborContract.setProvider(this.props.appContext.web3.currentProvider)
      laborContract.at(this.props.match.params.address)
        .then(instance => this.setupEventListeners(instance));
    }

    setupEventListeners(instance){
      let component = this;
      instance.LogContractSigned(null, { fromBlock: 0, toBlock: 'latest'}).watch(function(err, result){
        if (err) {
          console.log(err);
          return;
        }
        console.log('contract was signed');
        let signee = JSON.parse(result.args.data);
        signee.address = result.args.signee;
        component.setState({
          signees: component.state.signees.concat([signee])
        });
      });
    }

    // blah not best way of doing this - should probably store by key. TODO
    getContract(){
      let contractAddress = this.props.match.params.address;
      for(let i=0; i< this.props.contracts.length; i++){
        if (this.props.contracts[i].address === contractAddress)
          return this.props.contracts[i];
      }
    }

    loginUport(){
      this.props.appContext.uPort.requestCredentials().then((userProfile) => {
        console.log(userProfile); // note that to get avatar we need to have an app registered
         this.setState({
           uPortUser: {
             name: userProfile.name,
             //country: userProfile.country,
             address: userProfile.address,
             rinkebyAddress: MNID.decode(userProfile.address).address
           }
         })
      })
    }

    signContract(){
      let laborContractABI = this.props.appContext.uPortWeb3.eth.contract(LaborContract.abi)
      let laborContractObj = laborContractABI.at(this.props.match.params.address)
      laborContractObj.sign(JSON.stringify(this.state.uPortUser), (error, txHash) => {
        if (error) { throw error }
          this.waitForMined(txHash, { blockNumber: null }, // see next area
          function pendingCB () {
            // Signal to the user you're still waiting
            // for a block confirmation
            console.log('pending');
          },
          function successCB (data) {
            // Great Success!
            // Likely you'll call some eventPublisherMethod(txHash, data)
            console.log('success');
          }
        )
      })
    }

    waitForMined(txHash, response, pendingCB, successCB){
      let component = this;
      if (response.blockNumber) {
        successCB()
      } else {
        pendingCB()
          component.pollingLoop(txHash, response, pendingCB, successCB)
      }
    }

    // Recursive polling to do continuous checks for when the transaction was mined
    pollingLoop(txHash, response, pendingCB, successCB){
      let component = this;
      setTimeout(function () {
        component.props.appContext.uPortWeb3.eth.getTransaction(txHash, (error, response) => {
          if (error) { throw error }
            if (response === null) {
              response = { blockNumber: null }
            } // Some ETH nodes do not return pending tx
            component.waitForMined(txHash, response, pendingCB, successCB)
        })
      }, 1000) // check again in one sec.
    }

    render(){
      let contract = this.getContract();
      return (
        <div style={ style.contractView }>
          <div className="container">
            <div className="col-md-12" style={Object.assign({}, style.contractDataBox, style.boxBlueTop)}>
              <h3 style={ style.blueBoxHeader }>Contract Details</h3>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Contract Address:</div>
                <div className="col-md-9">{contract.address}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Position:</div>
                <div className="col-md-9">{contract.type}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Site of Employment:</div>
                <div className="col-md-9">{contract.site}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Contract Duration:</div>
                <div className="col-md-9">{contract.duration}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Monthly Salary:</div>
                <div className="col-md-9">{contract.salary}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Hours per Day (max):</div>
                <div className="col-md-9">{contract.hours}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Days per Week (max):</div>
                <div className="col-md-9">{contract.days}</div>
              </div>

              <h3>Benefits</h3>
              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Vacation Leave:</div>
                <div className="col-md-9">{contract.vacation}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Sick Leave:</div>
                <div className="col-md-9">{contract.sick}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Termination Advance:</div>
                <div className="col-md-9">{contract.termination}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Insurance Details:</div>
                <div className="col-md-9">{contract.insurance}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Transport:</div>
                <div className="col-md-9">{contract.transport ? "Included" : "Not Included"}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Food:</div>
                <div className="col-md-9">{contract.food ? "Included" : "Not Included"}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Housing:</div>
                <div className="col-md-9">{contract.housing ? "Included" : "Not Included"}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Free Emergency Medical:</div>
                <div className="col-md-9">{contract.medical ? "Included" : "Not Included"}</div>
              </div>

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Free Emergency Dental:</div>
                <div className="col-md-9">{contract.dental ? "Included" : "Not Included"}</div>
              </div>
            </div>

            {this.state.signees.length > 0
            ? <div className="col-md-12" style={ style.contractDataBox }>
                <h2>
                  Signees
                </h2>
                   <div className="col-md-12 signee-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>uPort Address</th>
                            <th>Rinkeby Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.signees.map((signee, index) =>
                            <tr key={index}>
                              <td>{signee.name}</td>
                              <td>{signee.address}</td>
                              <td>{signee.rinkebyAddress}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
              </div>
          : null}

          <div className="col-md-12" style={ style.contractDataBox }>
            <h2>
              {contract.name} - Sign
            </h2>
            {/* <h3>Status: Unsigned</h3> */}

              {/* <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-2"> Agency:</div>
                <div className="col-md-10"><button style={ style.secondaryBtn } onClick={() => this.signContract()}>Sign</button></div>
              </div> */}

              {this.state.uPortUser
              ?
              <div className="clearfix">
                <h3>Logged in as:</h3>
                <div className="clearfix" style={ style.contractSpacing }>
                  <div className="col-md-3">Name:</div>
                  <div className="col-md-9">{this.state.uPortUser.name}</div>
                </div>
                <div className="clearfix" style={ style.contractSpacing }>
                  <div className="col-md-3">uPort Address:</div>
                  <div className="col-md-9">{this.state.uPortUser.address}</div>
                </div>
                <div className="clearfix" style={ style.contractSpacing }>
                  <div className="col-md-3">Rinkeby Address:</div>
                  <div className="col-md-9">{this.state.uPortUser.rinkebyAddress}</div>
                </div>
                <div className="clearfix" style={ style.contractSpacing }>
                  <div className="col-md-3">Sign this Contract:</div>
                  <div className="col-md-9"><button style={ style.secondaryBtn } onClick={() => this.signContract()}>Sign</button></div>
                </div>
              </div>
              :
              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Employee/Candidate (Origin):</div>
                <div className="col-md-9"><button style={ style.secondaryBtn } onClick={() => this.loginUport()}>Sign Contract</button></div>
              </div>}

              <div className="clearfix" style={ style.contractSpacing }>
                <div className="col-md-3">Employer/Immigration (Destination)</div>
                <div className="col-md-9"><button style={ style.secondaryBtn } onClick={() => this.signContract()}>Verify Contract</button></div>
              </div>
          </div>

          </div>
        </div>


        // <div>
        //   <div style={ style.dashboard }>
        //       <div className="container">
        //           <ul style={style.dashboardTabHolder}>
        //               <li style={Object.assign({}, style.dashboardTabs, style.dashboardTabsInactive)}>Job Orders</li>
        //               <Link to={{ pathname: '/dashboard' }}>
        //                 <li style={style.dashboardTabs}>Contracts</li>
        //               </Link>
        //           </ul>
        //       </div>
        //   </div>
        //   <div className="container">
        //     <div className="row">
        //       <div className="col-md-8 contract-details">
        //         <h1>{contract.name}</h1>
        //         <p>At address: <span>{contract.address}</span></p>
        //         <div className="row">
        //           <div className="col-md-6">
        //             <strong>Site:</strong>
        //           </div>
        //           <div className="col-md-6">
        //             {contract.site}
        //           </div>
        //           <div className="col-md-6">
        //             <strong>Housing:</strong>
        //           </div>
        //           <div className="col-md-6">
        //             {contract.housing ? "Included" : "Not Included"}
        //           </div>
        //         </div>
        //       </div>
        //
        //       <div className="col-md-4 user-details">
        //         {this.state.uPortUser
        //         ? <div>
        //             <h2>
        //               {this.state.uPortUser.name}
        //             </h2>
        //             <p>
        //               uPort Address: {this.state.uPortUser.address}
        //             </p>
        //             <p>
        //               Rinkeby Address: {this.state.uPortUser.rinkebyAddress}
        //             </p>
        //         </div>
        //         : <p onClick={() => this.loginUport()}>Sign in to uPort</p>}
        //       </div>
        //
        //       {this.state.signees.length > 0
        //       ? <div className="col-md-12 signee-table">
        //           <table>
        //             <thead>
        //               <tr>
        //                 <th>Name</th>
        //                 <th>uPort Address</th>
        //                 <th>Rinkeby Address</th>
        //               </tr>
        //             </thead>
        //             <tbody>
        //               {this.state.signees.map((signee, index) =>
        //                 <tr key={index}>
        //                   <td>{signee.name}</td>
        //                   <td>{signee.address}</td>
        //                   <td>{signee.rinkebyAddress}</td>
        //                 </tr>
        //               )}
        //             </tbody>
        //           </table>
        //         </div>
        //       : null}
        //
        //
        //     {this.state.uPortUser
        //     ? <button onClick={() => this.signContract()}>Sign</button>
        //     : null}
        //     </div>
        //   </div>
        // </div>
      );
    }
}

export default ViewContract;
