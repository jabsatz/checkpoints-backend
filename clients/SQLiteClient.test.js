const fs = require('fs');
const SQLiteClient = require('./SQLiteClient');

const client = new SQLiteClient('test.db');

const markers = [
  {
    key: 12,
    latitude: -34.571284914,
    longitude: -58.381491348,
    local: false,
    label: 'Home',
  },
  {
    key: 15,
    latitude: -24.185498422,
    longitude: 12.531893589,
    local: false,
    label: 'Somewhere Else',
  },
];

const markersWithDBKeys = [
  {
    key: 1,
    latitude: -34.571284914,
    longitude: -58.381491348,
    local: false,
    label: 'Home',
  },
  {
    key: 2,
    latitude: -24.185498422,
    longitude: 12.531893589,
    local: false,
    label: 'Somewhere Else',
  },
];

afterAll(() => {
  client.close();
});

beforeEach(() => {
  client.runMigration();
});

test('database should exist', () => {
  fs.stat('test.db', (err) => {
    expect(err).toBe(null);
  });
});

it('should return an empty array when there are no markers', () => {
  client.getAllMarkers().then((allMarkers) => {
    expect(allMarkers).toHaveLength(0);
  });
});

it('should add two markers', async () => {
  const insertedMarkers = await client.insertAndGetUpdatedMarkers(markers);
  expect(insertedMarkers).toHaveLength(2);
  expect(insertedMarkers[0]).toMatchObject(markersWithDBKeys[0]);
  expect(insertedMarkers[1]).toMatchObject(markersWithDBKeys[1]);
});

describe('several operations', () => {
  beforeEach(() => {
    (async () => {
      await client.insertAndGetUpdatedMarkers(markers);
    })();
  });

  it('should retrieve all two markers', () => {
    (async () => {
      const allMarkers = await client.getAllMarkers();
      expect(allMarkers).toHaveLength(2);
      expect(allMarkers[0]).toMatchObject(markersWithDBKeys[0]);
      expect(allMarkers[1]).toMatchObject(markersWithDBKeys[1]);
    })();
  });

  it('should remove the second marker', () => {
    (async () => {
      await client.deleteOtherMarkers([markers[0]]);
      const allMarkers = await client.getAllMarkers();
      expect(allMarkers).toHaveLength(1);
      expect(allMarkers[0]).toMatchObject(markersWithDBKeys[0]);
    })();
  });

  it('should add a third marker', () => {
    (async () => {
      const newMarker = {
        key: 16,
        latitude: -64.185498422,
        longitude: 2.531893589,
        local: false,
        label: 'Yet Another Place',
      };
      await client.insertAndGetUpdatedMarkers([newMarker]);
      const allMarkers = await client.getAllMarkers();
      expect(allMarkers).toHaveLength(3);
      expect(allMarkers[0]).toMatchObject(markersWithDBKeys[0]);
      expect(allMarkers[1]).toMatchObject(markersWithDBKeys[1]);
      expect(allMarkers[2]).toMatchObject({ ...newMarker, key: 3 });
    })();
  });
});
