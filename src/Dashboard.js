import React, { Component } from 'react';
import style from './style/style';
import Contracts from './Contracts';

class Dashboard extends Component {
    render() {
        return (
            <div>
                <div style={ style.dashboard }>
                    <div className="container">
                        <ul style={style.dashboardTabHolder}>
                            <li style={Object.assign({}, style.dashboardTabs, style.dashboardTabsInactive)}>Job Orders</li>
                            <li style={style.dashboardTabs}>Contracts</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <Contracts appContext={this.props.appContext} contracts={this.props.contracts} />
                </div>
            </div>
        )
    }
}

export default Dashboard;
