var React = require('react');
var Link = require('react-router-dom').Link;
var PropTypes = require('prop-types');

class Navbar extends React.Component{
    render(){
        return (
            <div className='nav'>
                <Link to='/' ><h1 className='header'>{this.props.text}</h1></Link>
            </div>
        )
    }
}

Navbar.propTypes = {
    text: PropTypes.string.isRequired,
}

module.exports = Navbar;