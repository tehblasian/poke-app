var axios = require('axios');
var Pokedex = require('pokeapi-js-wrapper');
var options = {
    protocol: 'https',
}
var dex = new Pokedex.Pokedex(options);

var baseURL = 'https://pokeapi.co/api/v2';
var spriteURL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

var tools = require('./tools');

function getPokemonByGeneration(gen){
    return dex.getGenerationByName(gen).then(function(response){
        return response.pokemon_species.sort(function(a, b){
            return a.url.split('/')[6] - b.url.split('/')[6];
        });
    });
}

function getPokemonInfo(name){
    return dex.getPokemonByName(name).then(function(response){
        return getTypesAndWeaknesses(response.types).then(function(obj){
            return {
                typeList: obj.typeList,
                weaknesses: obj.weaknesses,
                info: response
            }
        })
    }).catch(handleError);
}

function getPokedexEntry(name){
    return dex.getPokemonSpeciesByName(name).then(function(response){
        return response;
    }).catch(handleError);
}

function getTypeWeakness(type){
    return dex.getTypeByName(type).then(function(response){
        return response.damage_relations;
    }).catch(handleError);
}

function buildEvoChain(evoData, evoChain){
    //get first pokemon in chain
    var evoDetails = evoData.evolution_details[0];
    evoChain.push({
        species_name: evoData.species.name,
        id: evoData.species.url.split('/')[6],
        min_level: !evoDetails ? 1 : evoDetails.min_level,
        trigger_name: !evoDetails ? null : evoDetails.trigger.name,
        item: !evoDetails ? null : evoDetails.item,
        move: !evoDetails? null : evoDetails.known_move
    });

    var mainList = evoData.evolves_to;
    mainList.map(function(evoData){
        do{
            var evoDetails = evoData.evolution_details[0];
            evoChain.push({
                species_name: evoData.species.name,
                id: evoData.species.url.split('/')[6],
                min_level: !evoDetails ? 1 : evoDetails.min_level,
                trigger_name: !evoDetails ? null : evoDetails.trigger.name,
                item: !evoDetails ? null : evoDetails.item,
                move: !evoDetails? null : evoDetails.known_move
            });
            if(evoData.evolves_to.length <= 1)
                evoData = evoData.evolves_to[0];
            else{
                evoData = evoData.evolves_to;
                evoData.map(function(evoData){
                     var evoDetails = evoData.evolution_details[0];
            evoChain.push({
                species_name: evoData.species.name,
                id: evoData.species.url.split('/')[6],
                min_level: !evoDetails ? 1 : evoDetails.min_level,
                trigger_name: !evoDetails ? null : evoDetails.trigger.name,
                item: !evoDetails ? null : evoDetails.item,
                move: !evoDetails? null : evoDetails.known_move
            });
                })
            }
            
        }while(!!evoData && evoData.hasOwnProperty('evolves_to'));
    })
}

function getEvolutionaryChain(id){
    return dex.getEvolutionChainById(id).then(function(response){
        //code from stackoverflow user Ryan
        var evoData = response.chain;
        var evoChain = [];
        buildEvoChain(evoData, evoChain);
        return evoChain;
    }).catch(handleError);
}

function getAllPokemonInfo(){
    return axios.get(baseURL + '/pokemon?limit=721').then(function(response){
        return response.data.results;
    }).catch(handleError);
}

function loadMorePokemon(number){
    return axios.get(baseURL + '/pokemon?offset=' + number + '&limit=40').then(function(response){
        return response.data.results;
    }).catch(handleError);
}

function getTypesAndWeaknesses(typeList){
    var types = typeList.map(function(entry){
        return entry.type.name;
    });

    return axios.all(types.map(getTypeWeakness)).then(function(relations){
        var temp;
        var weaknesses;
        if(types.length > 1){
            var doubleFromType1 = relations[0].double_damage_from.map(function(obj){ return obj.name; });
            var doubleFromType2 = relations[1].double_damage_from.map(function(obj){ return obj.name; });
            var doubleFromBoth = doubleFromType1.concat(doubleFromType2);

            var halfFromType1 = relations[0].half_damage_from.map(function(obj){ return obj.name; });
            var halfFromType2 = relations[1].half_damage_from.map(function(obj){ return obj.name; });
            var halfFromBoth = halfFromType1.concat(halfFromType2);

            temp = doubleFromBoth.filter(function(type){
                return halfFromBoth.indexOf(type) == -1;
            });

            weaknesses = temp.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            });
            
        }
        else weaknesses = relations[0].double_damage_from.map(function(obj){ return obj.name; });

        return {
            typeList: types,
            weaknesses: weaknesses
        }
    })

}

function handleError(error){
    console.warn(error);
    return null;
}

module.exports = {
    getPokedexEntry: function(name){
        return axios.all([getPokedexEntry(name), getPokemonInfo(name)]).then(function(data){
            var entry = data[0];
            var forms = data[0].varieties;
           
                return {
                    entry: entry,
                    typeList: data[1].typeList,
                    weaknesses: data[1].weaknesses,
                    info: data[1].info,
                    forms: forms,
                }
                    
        }).catch(handleError);
    },
    getAllPokemon: getAllPokemonInfo,
    getPokemonInfo: getPokemonInfo,
    loadMorePokemon: loadMorePokemon,
    getEvoChain: getEvolutionaryChain,
    getPokemonsByGeneration: getPokemonByGeneration
}