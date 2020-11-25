import React from 'react';
import {
    Route,
    RouteComponentProps
} from "react-router-dom";
import { 
    Nav,
    INavLink, 
    INavStyles, 
    INavLinkGroup
} from '@fluentui/react/lib/Nav';
import { withRouter, } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react/lib/Icons';

import { SudokuUI } from './Sudoku/SudokuUI';
import { TicTacToe } from './TicTacToe/TicTacToe';   
import { ReduxSandbox } from './ReduxSandbox/ReduxSandbox';
import CodeExcercises from './CodeExcercises/CodeExcercises';
import './App.css';

// Initialize Fluent UI Icons to be used in Components, no need to initialize anywhere else
initializeIcons();

// Attempt to extend the INavLink interface inside INavLinkGroup, this is all a terrible way to do things, just exploring.
interface CustomINavLink extends INavLink {
    component: React.ComponentType;
}

// TODO: <Route path="/page/:id" component={SamplePage} />
const navLinks: CustomINavLink[] = [
    {
        name: 'Sudoku Solver',
        url: '/',
        key: '/',
        component: SudokuUI,
    },
    {
        name: 'Redux Sandbox',
        url: '/ReduxSandbox',
        key: '/ReduxSandbox',
        component: ReduxSandbox,
    },
    {
        name: 'Tic Tac Toe',
        url: '/TicTacToe',
        key: '/TicTacToe',
        component: TicTacToe,
    },
    {
        name: 'Code Excercises',
        url: '/CodeExcercises',
        key: '/CodeExcercises',
        component: CodeExcercises,
    }
];

// Enforcing our custom INavLink above, so here just conforming to the expected for the component
const navLinkGroups: INavLinkGroup[] = [
    {
        links: navLinks,
    },
];

const navStyles: Partial<INavStyles> = {
    root: {
        width: 208,
        boxSizing: 'border-box',
        border: '1px solid #eee',
        overflowY: 'auto',
        minHeight: '100vh',
    },
};

// Main app, wires up left nav and app content body, add new compents and properties to navLinks [] above and route and comonent auto added below
function App({ history }: RouteComponentProps): JSX.Element {
    const routes = navLinkGroups[0]?.links.map(link => {
        return (
            <Route 
                key={link.key}    
                path={link.url} 
                exact 
                component={link.component} 
                />
        )
    })

    const handleLinkClick = (ev?: React.MouseEvent<HTMLElement>, item?: INavLink) => {
        ev?.preventDefault();
        item && history.push(item.url);
    }

    return (
        <div className="App">
            <div className="body">
                <div className="leftnav">
                    <div className={ "profilePic" }>
                        <img 
                            src="/schiebs_square.png"
                            alt="schiebs"
                        />
                    </div>
                    <Nav
                        onLinkClick={ handleLinkClick }
                        selectedKey={ history.location.pathname }
                        styles={ navStyles }
                        groups={ navLinkGroups }
                        className={ "SideNav" }
                    />
                </div>
                <div className="content">
                    { routes }
                </div>
            </div>
        </div>
    )
};

// Return app wrapped with Router so that the Left nav has access to the router history
export default withRouter(App);