function capitlaizeFirst(word){
    word = word.charAt(0).toUpperCase() + word.slice(1);
    return word;
}

module.exports = {
    capitlaizeFirst: capitlaizeFirst,
}