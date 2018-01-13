var React = require('react');
var PropTypes = require('prop-types');
var Link = require('react-router-dom').Link;

var api = require('../utils/api');
var tools = require('../utils/tools');

var PokePreview = require('./PokePreview');
var Loading = require('./Loading');

class Main extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            selectedGen: 'All',
            pokelist: null,
            filtered: null,
            loading: true,
            error: '',
        }

        this.updateGeneration = this.updateGeneration.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
    }

    componentDidMount(){
        this.updateGeneration(this.state.selectedGen);
    }

    handleFilter(event){
        event.preventDefault();
        var value = event.target.value;
        var regex = new RegExp(value, 'i');
        var filteredList = this.state.pokelist.filter(function(pokemon){
            return pokemon.name.search(regex) > -1;
        })

        this.setState(function(){
            return {
                filtered: filteredList,
            }
        })
    }

    updateGeneration(gen){
        var gens = {'All': 'All', 'Gen I': 1, 'Gen II': 2, 'Gen III': 3, 'Gen IV': 4, 'Gen V': 5, 'Gen VI': 6};
        var query = gens[gen];
        this.setState(function(){
            return {
                selectedGen: gen,
                pokelist: null,
                filtered: null,
                loading: true,
                error: ''
            }
        });

        if(query === 'All') {
            api.getAllPokemon().then(function(pokelist){
                if(pokelist === null){
                    this.setState(function(){
                        return {
                            loading: false,
                            error: 'Oops! Something went wrong...',
                        }
                    });
                }
                else{
                    this.setState(function(){
                        return {
                            pokelist: pokelist,
                            filtered: pokelist,
                            loading: false,
                        }
                    });
                }
            
            }.bind(this)); 
        }
        else{
            api.getPokemonsByGeneration(query).then(function(pokelist){
                if(pokelist === null){
                    this.setState(function(){
                        return {
                            error: 'Oops! Something went wrong...',
                            loading: false
                        }
                    })
                }
                else{
                    this.setState(function(){
                        return {
                            pokelist: pokelist,
                            filtered: pokelist,
                            loading: false,
                        }
                    })
                }
            }.bind(this))
        } 
    }

    render(){
        var loading = this.state.loading;
        var error = this.state.error;

        if(loading){
            return <div className='home-container'>
                <Loading text={'Loading Entries'}/>
            </div>
        }

        if(error){
            return <div className='home-container'>
                    <h1 style={{textAlign: 'center', fontSize: '40px', fontWeight: 100}}>{this.state.error}</h1>
            </div>
        }
       
            return ( 
                <div className='home-container'>
                    <h1 className='fine-print'>*Pokemon data provided by <a href='http://pokeapi.co/'>pokeapi.co</a></h1>
                    <div className='search-filter-container'>
                        <h1 className='info-title' style={{textAlign: 'center'}}>Search for your favorite Pokemon!</h1>
                        <input
                            type='text'
                            className='search-filter'
                            placeholder='i.e Pikachu'
                            onChange={this.handleFilter} />
                    </div>
                    <SelectGeneration selectedGeneration={this.state.selectedGen} onSelect={this.updateGeneration}/>
                    <ul className='poke-grid'>
                        {this.state.filtered.map(function(pokemon, index){
                            var id = pokemon.url.split('/')[6];
                            var nameSplit = pokemon.name.split('-');
                            
                            var name = '';
                            if(pokemon.name === 'mr-mime'){
                                name = 'Mr. Mime'; 
                            }
                            else if(nameSplit.length > 1) name = tools.capitlaizeFirst(nameSplit[0]);
                            else name = tools.capitlaizeFirst(pokemon.name);
                            return (
                                <li key={pokemon + '_' + index}>
                                    <Link   key={pokemon.name + '_' + id} 
                                            to={{pathname: '/entry', search: '?pokemon_id=' + id, params: pokemon.name}}> 
                                    <PokePreview  
                                            style={{backgroundColor: '#f2f2f2', borderRadius: '10px'}}
                                            number={id} 
                                            sprite={'./images/sprites/pokemon/other-sprites/official-artwork/' + id + '.png'} 
                                            name={name}/>
                                    </Link>  
                                </li>
                            )
                        })}
                    </ul>
                </div>            
            )
        
    }
}

function SelectGeneration (props){
    var gens = ['All', 'Gen I', 'Gen II', 'Gen III', 'Gen IV', 'Gen V', 'Gen VI'];
    return(
        <ul className = 'generations' > 
            { gens.map(function (generation) {
                return <li style = { generation === props.selectedGeneration ? { color: '#ee1515' } : null }
                onClick = { props.onSelect.bind(null, generation) } 
                key = { generation}> {generation} </li>;
            })} 
        </ul>
    )
}

SelectGeneration.propTypes = {
    selectedGeneration: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired
}

module.exports = Main;

