function getSearchTerm(type, _term, artist, album, track) {
    var term = _term.slice()
    console.log(`[DEBUG] [DeezerDef] term: ${term}, artist: ${artist}, album: ${album}, track: ${track}`)
    var newTerm = '';
    
    terms = []

    while (term.indexOf(":") > -1){    
        
        var entityMatching = {
            'artist' : {
            'match' : (term.indexOf('artist:') > -1 ? true : false), 
            'matching_pattern' : 'artist:', 
            'matching_index' : term.indexOf('artist:')
            },
            'track' : {
            'match' : (term.indexOf('track:') > -1 ? true : false), 
            'matching_pattern' : 'track:', 
            'matching_index' : term.indexOf('track:')
            },
            'album' : {
            'match' : (term.indexOf('album:') > -1 ? true : false), 
            'matching_pattern' : 'album:', 
            'matching_index' : term.indexOf('album:')
            }
        }
    
        var matchingEntitiesArray = Object.keys(entityMatching)
        .filter((value, index, arr) => entityMatching[value].match)

        console.log(matchingEntitiesArray)
    
        var matching_indexes = matchingEntitiesArray.map((value, idx, arr) => entityMatching[value].matching_index)
        var matching_index = matching_indexes.indexOf(Math.min(...matching_indexes))
        
        var matching_entity_type = matchingEntitiesArray[matching_index]
        var matching_entity = entityMatching[matching_entity_type]
        var matching_entity_value = ""

        var nextPos = -1
        if (term.substring(term.indexOf(":")+1).indexOf(":") > -1) {
            nextPos = term.substring(term.indexOf(":")+1).indexOf(":")
            
            if (nextPos > -1 ){
                matching_entity_value = term.substring(matching_entity.matching_index, matching_entity.matching_pattern.length + (nextPos - matching_entity.matching_index))
            }
            else {
                matching_entity_value = term.substring(matching_entity.matching_index)
            }
        }
        
        terms.push(`${matching_entity_type}:"${matching_entity_value}" `)

        term = term.substring(nextPos)
  
    }
  
    console.log(`[DEBUG] [DeezerDef] terms: ${terms}`)
    
    newTerm = encodeURIComponent(newTerm);
    console.log(`[DEBUG] [DeezerDef] newTerm : ${newTerm}`)
    return newTerm;

}


console.log(getSearchTerm("album", 'album:"heligoland":artist:"massive attack'))

