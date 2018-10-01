const deezerDef = require('../../lib/music_services/deezerDef');

test('getSearchTerm should parse artist parameter correctly', () => {
  var type = "artist"
  var term = "artist:toots"
  var artist = ""
  var album = ""
  var track = ""

  expect(deezerDef.term(type, term, artist, album, track))
  .toBe(encodeURIComponent('artist:toots'))
});

test('getSearchTerm should parse artist parameter correctly', () => {
  var type = "artist"
  var term = "artist:La Rue Kétanou"
  var artist = ""
  var album = ""
  var track = ""

  expect(deezerDef.term(type, term, artist, album, track))
    .toBe(encodeURIComponent('artist:La Rue Kétanou'))
});

test('getSearchTerm should parse artist & track parameters correctly', () => {
  var type = "artist"
  var term = "artist:La Rue Kétanou:track:Ma faute à toi"
  var artist = ""
  var album = ""
  var track = ""

  expect(deezerDef.term(type, term, artist, album, track))
    .toBe(encodeURIComponent('artist:La Rue Kétanou track:Ma faute à toi'))
});

