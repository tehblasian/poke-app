var React = require('react');
var ReactRouter = require('react-router-dom');
var BrowserHistory = require('react-router-dom').BrowserHistory;
var Router = ReactRouter.BrowserRouter;
var Route = ReactRouter.Route;
var Switch = ReactRouter.Switch;

var Main = require('./Main');
var PokeDetails = require('./PokeDetails');
var Navbar = require('./Navbar');

class App extends React.Component{
    render(){
        return(
            <Router>
                <div className='container'> 
                    <Navbar text='The National Dex'/>
                    <Switch>
                        <Route exact path='/' component={Main}/>
                        <Route path='/entry' component={PokeDetails}/>
                        <Route render={function(){ return <p className='info-title' style={{textAlign: 'center'}}>Error 404: Page Not Found</p> }}/>
                    </Switch>
                    
                </div>
            </Router> 
        )
    }
}

module.exports = App;