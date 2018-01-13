var React = require('react');
var PropTypes = require('prop-types');
var Link = require('react-router-dom').Link;
var MediaQuery = require('react-responsive');

var api = require('../utils/api');
var queryString = require('query-string');
var BarChart = require('react-chartjs-2').Bar;
var tools = require('../utils/tools');

var Loading = require('./Loading');
var PokePreview = require('./PokePreview');

class PokeDetails extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            entry: null,
            info: null,
            typeList: null,
            weaknesses: null,
            formList: null,
            currentForm: null,
            loading: true,
            error: '',
        }

        this.handleLoad = this.handleLoad.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.getNextForm = this.getNextForm.bind(this);
    }

    componentDidMount(){
        var pokemon = queryString.parse(this.props.location.search).pokemon_id;
        this.handleLoad(pokemon);
    }

    componentWillReceiveProps(nextProps){
        this.setState(function(){
            return {
                entry: null,
                info: null,
                typeList: null,
                weaknesses: null,
                loading: true,
                error: '',
            }
        })
        var pokemon = queryString.parse(nextProps.location.search).pokemon_id;
        this.handleLoad(pokemon);
    }

    handleLoad(pokemon){
        api.getPokedexEntry(pokemon).then(function(pokemon){
            if(pokemon === null){
                this.setState(function(){
                    return {
                        error: 'Sorry! Could not fetch Pokedex entry.',
                        loading: false
                    }
                });
            }
            else{
                this.setState(function(){
                    return {
                        entry: pokemon.entry,
                        info: pokemon.info,
                        typeList: pokemon.typeList,
                        weaknesses: pokemon.weaknesses,
                        formList: pokemon.forms,
                        currentForm: 0,
                        loading: false
                    }
                });
            }       
        }.bind(this));
    }

    handleFormChange(){
        var currentFormIndex = this.state.currentForm;
        var newFormIndex = ++currentFormIndex;
        if(newFormIndex > this.state.formList.length - 1) newFormIndex = 0;
        var newForm = this.state.formList[newFormIndex].pokemon.name;
        api.getPokemonInfo(newForm).then(function(pokemon){
            if(pokemon === null){
                this.setState(function(){
                    return {
                        error: 'Could not load ' + newForm + '\'s entry!'
                    }
                })
            }
            else{
                this.setState(function(){
                    return {
                        currentForm: newFormIndex,
                        info: pokemon.info,
                        typeList: pokemon.typeList,
                        weaknesses: pokemon.weaknesses
                    }                    
                })

            }
        }.bind(this));
    }

    getNextForm(){
        var list = this.state.formList;
        var currentFormIndex = this.state.currentForm;
        var nextFormIndex = (currentFormIndex + 1) % list.length;
        var formName = 'Click to see ' + formatName(list[nextFormIndex].pokemon.name);

        return formName;
    }

    render(){
        var loading = this.state.loading;
        var error = this.state.error;

        if(loading){
            return <div className='poke-detail-container'>
                <Loading text={'Loading Pokedex Entry' }/>
            </div>
        }

        if(error){
            return <div className='poke-detail-container'>
                <h1 className='info-title' style={{textAlign: 'center', margin: '1em'}}>{this.state.error}</h1> 
            </div>
        }

        var evoChain = this.state.entry.evolution_chain.url.split('/')[6];
        return (
            <div className='poke-detail-container'>
                <MediaQuery minDeviceWidth={1658}>
                    <ul className='poke-details'>
                        <li onClick={this.state.formList.length > 1 && this.handleFormChange}>
                            <PokePreview  
                                number={this.state.entry.id} 
                                sprite={'./images/sprites/pokemon/other-sprites/official-artwork/' + this.state.info.id + '.png'} 
                                name={formatName(this.state.info.name)}
                                height='320px'
                                style={{width: '320px', marginRight: '5px'}}>
                            {this.state.formList.length > 1 && <h1 className='info-title' style={{fontSize: '15px', textAlign: 'center'}}>{this.getNextForm()}</h1>}
                            </PokePreview>
                        </li>
                        <li style={{width: '90%'}}> 
                            <ul>
                                <li>
                                    <p className='dex-entry'>{this.state.entry.flavor_text_entries[1].flavor_text}</p>  
                                </li>
                                <li>
                                    <PokeInfo 
                                        category={this.state.entry.genera[0].genus} 
                                        height={this.state.info.height / 10.0} 
                                        weight={this.state.info.weight / 10.0} 
                                        abilities={this.state.info.abilities} 
                                        gender={this.state.currentForm == 0 && this.state.entry.gender_rate || -1}/>
                                </li>
                            </ul>
                        </li> 
                        <li>
                            <TypeContainer typeList={this.state.typeList} weaknesses={this.state.weaknesses}/>
                        </li>
                    </ul>
                    <ul style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}>
                        <li style={{minWidth: '50%'}}>
                            <EvolutionChain chain={evoChain}/>
                        </li>
                        <li  style={{width: '50%'}}>
                            <PokeStats stats={this.state.info.stats}/>
                        </li>
                    </ul>
                </MediaQuery>
                <MediaQuery maxDeviceWidth={1657}>
                    <MediaQuery minDeviceWidth={1025}>
                        <ul className='poke-details'>
                            <li onClick={this.state.formList.length > 1 && this.handleFormChange}>
                                <PokePreview  
                                    number={this.state.entry.id} 
                                    sprite={'./images/sprites/pokemon/other-sprites/official-artwork/' + this.state.info.id + '.png'} 
                                    name={formatName(this.state.info.name)}
                                    height='320px'
                                    style={{width: '320px', marginRight: '5px'}}>
                                {this.state.formList.length > 1 && <h1 className='info-title' style={{fontSize: '15px', textAlign: 'center'}}>{this.getNextForm()}</h1>}
                                </PokePreview>
                            </li>
                            <li> 
                                <ul>
                                    <li>
                                        <p className='dex-entry' style={{maxWidth: '790px'}}>{this.state.entry.flavor_text_entries[1].flavor_text}</p>  
                                    </li>
                                    <li>
                                        <PokeInfo 
                                            category={this.state.entry.genera[0].genus} 
                                            height={this.state.info.height / 10.0} 
                                            weight={this.state.info.weight / 10.0} 
                                            abilities={this.state.info.abilities} 
                                            gender={this.state.currentForm == 0 && this.state.entry.gender_rate || -1}/>
                                    </li>
                                </ul>
                            </li> 
                        </ul>
                        <ul style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                            <li>
                                <TypeContainer typeList={this.state.typeList} weaknesses={this.state.weaknesses}/>
                            </li>
                            <li style={{width: '70%', marginRight: '1em'}}>
                                <PokeStats stats={this.state.info.stats} />
                            </li>
                        </ul>
                        <EvolutionChain chain={evoChain} style={{display: 'inline-block', marginTop: '4em'}}/>       
                    </MediaQuery>
                </MediaQuery>
                <MediaQuery maxDeviceWidth={1024}>
                    <ul className='poke-details'>
                        <li onClick={this.state.formList.length > 1 && this.handleFormChange}>
                            <PokePreview  
                                number={this.state.entry.id} 
                                sprite={'./images/sprites/pokemon/other-sprites/official-artwork/' + this.state.info.id + '.png'} 
                                name={formatName(this.state.info.name)}
                                height='320px'
                                style={{width: '320px', marginRight: '5px'}}>
                            {this.state.formList.length > 1 && <h1 className='info-title' style={{fontSize: '15px', textAlign: 'center'}}>{this.getNextForm()}</h1>}
                            </PokePreview>
                        </li>
                        <li style={{width: '90%'}}> 
                            <ul>
                                <li>
                                    <p className='dex-entry' style={{maxWidth: '790px'}}>{this.state.entry.flavor_text_entries[1].flavor_text}</p>  
                                </li>
                                <li>
                                    <PokeInfo 
                                        category={this.state.entry.genera[0].genus} 
                                        height={this.state.info.height / 10.0} 
                                        weight={this.state.info.weight / 10.0} 
                                        abilities={this.state.info.abilities} 
                                        gender={this.state.currentForm == 0 && this.state.entry.gender_rate || -1}/>
                                </li>
                            </ul>
                        </li> 
                    </ul>
                    <TypeContainer typeList={this.state.typeList} weaknesses={this.state.weaknesses} style={{display: 'flex', flexDirection: 'row'}}/>
                    <br/>                 
                    <PokeStats stats={this.state.info.stats} />
                    <br/>             
                    <EvolutionChain chain={evoChain} style={{display: 'inline-block', marginTop: '4em'}}/>       
                </MediaQuery>
            <a href='http://pokeapi.co/'><h1 className='fine-print' style={{marginTop: '3em'}}>*Pokemon data provided by pokeapi.co</h1></a>
            </div>
        )
    }
}

function TypeList(props){
    var typeColors = {
        normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c', ice: '#96d9d6', fighting: '#c22e28', poison: '#a33ea1',
        ground: '#e2bf65', flying: '#a98ff3', psychic: '#f95587', bug: '#a6b91a', rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746',
        steel: '#b7b7ce', fairy: '#d685ad'
    }
    return (
        <div className='type-container'>
            <ul className='type-list'>
                {props.types.map(function(type){
                    return <li key={type} style={{backgroundColor: typeColors[type]}}>{tools.capitlaizeFirst(type)}</li>
                })}
            </ul>
        </div>
    )
}

TypeList.propTypes = {
    types: PropTypes.array.isRequired
}

function TypeContainer(props){
    return (
        <div className='type-weakness-container'>
            <ul className='type-weakness-list'>
                <li>
                    <h1 className='header' style={{color: '#333', textAlign: 'left', paddingRight: '40px'}}>Type</h1>
                    <TypeList types={props.typeList}/>
                </li>
                <li>
                    <h1 className='header' style={{color: '#333', textAlign: 'left', paddingRight: '40px'}}>Weaknesses</h1>
                    <TypeList types={props.weaknesses}/>
                </li>
            </ul>
        </div>
    )
}

TypeContainer.propTypes = {
    typeList: PropTypes.array.isRequired,
    weaknesses: PropTypes.array.isRequired
}

function PokeInfo(props){
    return (
        <div className='poke-info-container'>
            <ul className='poke-info'>
                <li>
                    <div className='info-title'>Category</div>         
                    <div className='info-value'>{props.category}</div>
                </li>
                <li>
                    <div className='info-title'>Height</div>                 
                    <div className='info-value'>{props.height}m</div>          
                </li>
                <li>
                    <div className='info-title'>Weight</div>                
                    <div className='info-value'>{props.weight}kg</div>  
                </li>
                <li>
                    <div className='info-title'>Abilities</div>
                    {props.abilities.reverse().map(function(data, index){ 
                        return <div className='info-value' key={data.ability.name + '_' + index}>{tools.capitlaizeFirst(data.ability.name)}</div>
                    })} 
                </li>
                <li>
                    <div className='info-title'>Gender</div>
                  
                    {formatGender(props.gender)}
                </li>
            </ul>
        </div>
    )
}

PokeInfo.propTypes = {
    category: PropTypes.string.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    abilities: PropTypes.array.isRequired,
    gender: PropTypes.number.isRequired
}

function PokeStats(props){
    var stats = props.stats.map(function(entry){
        var name = tools.capitlaizeFirst(entry.stat.name);
        if(name === 'Special-attack') name = 'Sp. Atk';
        else if (name === 'Special-defense') name = 'Sp. Def';

        return {
            stat_name: name,
            base_stat: entry.base_stat,
        }
    }).reverse();

    var datasets = [];
    var statColors = ["rgba(255, 89, 89, 0.8)", "rgba(245, 172, 120, 0.8)", "rgba(250, 224, 120, 0.8)", 
                        "rgba(157, 183, 245, 0.8)", "rgba(167, 216, 141, 0.8)", "rgba(250, 146, 178, 0.8)"];

    datasets.push({
        label: 'Base Stat',
        backgroundColor: statColors,
        data: stats.map(function(stat){ return stat.base_stat; })
    });

    var data = {
        labels: stats.map(function(stat){ return stat.stat_name; }),
        datasets: datasets,    
    }

    var fonts = '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif';

    var options = {
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    max: 180,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Strength',
                    fontFamily: fonts,
                }
            }],
        },
        legend: {
            display: false
        }
    }

    var total = stats.reduce(function(accumulator, stat){
        return accumulator + stat.base_stat;
    }, 0);

    return (
        <div className='poke-stats-container' >
            <h1 className='info-title' style={{marginBottom: '10px'}}>Stats</h1>
            <BarChart 
                data={data} 
                options={options}
                />
            <h1 className='info-value'>Total: {total}</h1>
        </div>
    )
}

PokeStats.propTypes = {
    stats: PropTypes.array.isRequired
}

class EvolutionChain extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            evoChain: null,
            loading: true,
            error: '',
        }
    }

    componentDidMount(){
        api.getEvoChain(this.props.chain).then(function(response){
            if(response == null){
                this.setState(function(){
                    return {
                        loading: false,
                        error: 'Could not load evolutionary chain!'
                    }
                })
            }
            else{
                this.setState(function(){
                    return {
                        evoChain: response,
                        loading: false
                    }
                })
            }
        }.bind(this))
    }

    render(){
        var loading = this.state.loading;
        var error = this.state.error;

        if(loading){
            return <div className='evo-chain-container' style={{marginTop: '3em'}}>
                <Loading text={'Loading Evolutionary Chain' }/>
            </div>
        }

        if(error){
            return <div className='evo-chain-container'>
                <h1 className='header'>{this.state.error}</h1> 
            </div>
        }

        return (
            <div className='evo-chain-container' style={this.props.style}>
                <h1 className='info-title'>Evolutions</h1>
                {this.state.evoChain.length == 1 && <h1 className='info-value'>This Pokemon does not evolve.</h1>}
                <ul className='evo-chain'>
                    {this.state.evoChain.map(function(entry, index, chain){
                        return (
                            <li key={entry.species_name + '_' + index} className='evo-chain-item'>
                                <ul className='row'>
                                    <li>
                                        <Link to={{pathname: '/entry/', search: '?pokemon_id=' + entry.id}}> 
                                        <div className='poke-coin'>
                                            <img className='evo-sprite' 
                                                src={'./images/sprites/pokemon/other-sprites/official-artwork/' + entry.id + '.png'} 
                                                alt={entry.species_name} />
                                        </div>
                                            <h1 style={{textAlign: 'center'}}>
                                                <span style={{fontSize: '20px'}}>#{entry.id} </span>
                                                {tools.capitlaizeFirst(entry.species_name)}
                                            </h1>
                                        </Link>
                                    </li>
                                    { index < this.state.evoChain.length - 1 && 
                                        <li style={{paddingBottom: '4em'}}>
                                            <dd>
                                                {
                                                    chain[index + 1].min_level && <h1 className='info-value' style={{marginBottom: '1em', fontSize: '24px'}}>Lvl. {chain[index + 1].min_level }</h1> 
                                                    || <h1 style={{visibility: 'hidden'}}>placeholder</h1>
                                                }
                                            </dd>
                                            <dd>
                                                { 
                                                    (entry.trigger_name !== 'use-item' && entry.min_level !== null) && <img className='chevron' src='./images/chevron-right.png' style={{marginRight: '1.5em'}}/>
                                                    || <h1 style={{fontWeight: '600', position: 'relative', right: '0.9em', bottom: '1em'}}>OR</h1>
                                                }
                                            </dd>
                                        </li> 
                                    }
                                </ul>
                            </li> 
                        )
                    }.bind(this))}
                </ul>
            </div>
        )
    }
    
}

function formatGender(eigths){
    if(eigths == -1){
        return (
            <div className='info-value'>Unknown</div>
        )
    }
    else{
        var chanceOfBeingFemale = (eigths / 8.0) * 100;
        var chanceOfBeingMale = 100 - chanceOfBeingFemale;

        return (
            <div  className='info-value'>
                <div>Male: {chanceOfBeingMale}%</div>
                <div>Female: {chanceOfBeingFemale}%</div>
            </div>
        ) 

    }
    
}

function formatName(name){
    var split = name.split('-').map(function(split){
        return tools.capitlaizeFirst(split);
    })

    var formattedName = (split[1] ? split[1] : '') + ' ' + split[0];
    if(split[2]) formattedName += ' ' + split[2]
    
    return formattedName;
}

module.exports = PokeDetails;