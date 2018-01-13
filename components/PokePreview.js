var React = require('react');
var PropTypes = require('prop-types');

function PokePreview(props){
    return(
        <div className='poke-preview-item' style={props.style}>
            <h1>#{props.number}</h1>
            <img className='poke-sprite' src={props.sprite} alt={props.name} height={props.height}/>
            <h1>{props.name}</h1>
            {props.children}    
        </div>
    )
}

PokePreview.propTypes = {
    sprite: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

PokePreview.defaultProps = {
    height: '150px'
}

module.exports = PokePreview;