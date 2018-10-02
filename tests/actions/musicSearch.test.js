const musicSearch = require('../../lib/actions/musicSearch');

test('extractEntitiesFromTerm parses correctly artist', () => {
    var term = 'artist:"Toots and the Maytals"'
    var mockedApi = {
      registerAction: jest.fn()
    }

    var [artist, album, track] = musicSearch(mockedApi).extractEntities(term)
    
    expect(artist).toBe("Toots and the Maytals")
    expect(album).toBeUndefined()
    expect(track).toBeUndefined()

  });

test('extractEntitiesFromTerm parses correctly album', () => {
    var term = 'album:"Astroworld"'
    var mockedApi = {
      registerAction: jest.fn()
    }

    var [artist, album, track] = musicSearch(mockedApi).extractEntities(term)
    
    expect(artist).toBeUndefined()
    expect(album).toBe("Astroworld")
    expect(track).toBeUndefined()

  });
    
  test('extractEntitiesFromTerm parses correctly track', () => {
    var term = 'track:"Stargazing"'
    var mockedApi = {
      registerAction: jest.fn()
    }

    var [artist, album, track] = musicSearch(mockedApi).extractEntities(term)
    
    expect(artist).toBeUndefined()
    expect(album).toBeUndefined()
    expect(track).toBe("Stargazing")

  });
  
  test('extractEntitiesFromTerm parses correctly track + artist', () => {
    var term = 'artist:"Travis $cott":track:"Stargazing"'
    var mockedApi = {
      registerAction: jest.fn()
    }

    var [artist, album, track] = musicSearch(mockedApi).extractEntities(term)
    
    expect(artist).toBe("Travis $cott")
    expect(album).toBeUndefined()
    expect(track).toBe("Stargazing")

  });