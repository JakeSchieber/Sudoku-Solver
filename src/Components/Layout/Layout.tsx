import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    RouteComponentProps
  } from "react-router-dom";

import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
//import {Button, ButtonType} from 'office-ui-fabric-react/lib/Button';
import {Dialog, DialogType, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, CompoundButton, Button } from '@fluentui/react';
import { Nav, INavLink, INavStyles, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { SudokuUI } from './../Sudoku/SudokuUI';
import './Layout.css';
import {ReduxSandbox} from './../ReduxSandbox/ReduxSandbox';

interface AppState {
    isOpen: boolean;
}

export default class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isOpen: false,
        }
    }

    open = () => {
        console.log("open");
        this.setState({
            isOpen: true
        })
    }

    close = () => {
        console.log("close");
        this.setState({
            isOpen: false
        })
    }

    render() {
        /*
        return (
            <div>
            <div style={{margin: '5em'}}>
                <Button onClick={this.open}>I am a button.</Button>
            </div>
            <Dialog
                isOpen={this.state.isOpen}
                type={DialogType.close}
                // onDismiss={this.close.bind(this)}
                title='Dialog title'
                subText='Dialog subText'
                isBlocking={false}
                closeButtonAriaLabel='Close'
            >
                <h1>Hello, World!</h1>
                <DialogFooter>
                <Button buttonType={ButtonType.primary} onClick={this.close}>OK</Button>
                </DialogFooter>
            </Dialog>
            </div>
        );

        <div className="App">
            <div className="body">
                <NavBasicExample />
                <div className="content">
                    <PrimaryButton />
                    <CompoundButton primary secondaryText="This is the secondary text." disabled={false} checked={false}>
                        Standard
                    </CompoundButton>
                    <PrimaryButton text="Standard" />
                </div>                
                <div className="footer"></div>
            </div>

            <div className="App">
                <div className="body">
                    <NavBasicExample />
                    <div className="content">
                        <SudokuUI />
                    </div>
                </div>
            </div>

            <nav>
                            <ul>
                                <li>
                                    <Link to="/">Home</Link>
                                </li>
                                <li>
                                    <Link to="/page/1">Page 1</Link>
                                </li>
                                <li>
                                    <Link to="/page/2">Page 2</Link>
                                </li>
                            </ul>
                            <Route path="/" exact component={Index} />
                            <Route path="/page/:id" component={SamplePage} />
                        </nav>
        */
        return (
            <Router>
                <div className="App">
                    <div className="body">
                        <NavBasicExample />
                        <div className="content">
                            <Route path="/" exact component={SudokuUI} />
                            <Route path="/page/:id" component={SamplePage} />
                            <Route path="/ReduxSandbox" component={ReduxSandbox} />
                        </div>
                    </div>
                </div>
            </Router>
       );
    }
}

function Index() {
    return <h2>Home</h2>;
}

type TParams = { id: string };
function SamplePage({ match }: RouteComponentProps<TParams>) {
    return (<h2>Showing page with product ID: {match.params.id}</h2>);
}


const navStyles: Partial<INavStyles> = {
    root: {
        width: 208,
        boxSizing: 'border-box',
        border: '1px solid #eee',
        overflowY: 'auto',
    },
};
  
const navLinkGroups: INavLinkGroup[] = [{
    links: [
    {
        name: 'Home',
        url: '/',
    },
    {
        name: 'Sample page',
        url: '/page/1',
    },
    {
        name: 'Documents',
        url: 'http://example.com',
        key: 'key3',
        isExpanded: true,
        target: '_blank',
    },
    {
        name: 'Pages',
        url: 'http://msn.com',
        key: 'key4',
        target: '_blank',
    },
    {
        name: 'Notebook',
        url: 'http://msn.com',
        key: 'key5',
        disabled: true,
    },
    {
        name: 'Communication and Media',
        url: 'http://msn.com',
        key: 'key6',
        target: '_blank',
    },
    {
        name: 'News',
        url: 'http://cnn.com',
        icon: 'News',
        key: 'key7',
        target: '_blank',
    },
    ],
},];

const CustomLink = (props: any) => {
    return (<Link to="/page/2">Page 2</Link>);
}

// TODO: implement this into our Router above
// Learn how to set the proper selectedKey
// TODO: optimize so that page does not need to be reloaded after clicking a link.
export const NavBasicExample: React.FunctionComponent = () => {
    // TODO: Implement state management to detect current page.
    return (
        <Nav
            // onLinkClick={_onLinkClick}
            selectedKey="key3"
            styles={navStyles}
            groups={navLinkGroups}
            className={"SideNav"}
            //linkAs={CustomLink}
        />
    );
};

function _onLinkClick(ev?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    if (item && item.name === 'News') {
        alert('News link clicked');
    }
}