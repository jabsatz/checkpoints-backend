const sqlite3 = require('sqlite3').verbose();

class SQLiteClient {
  constructor(dbName = 'markers.db') {
    this.db = new sqlite3.Database(dbName);
  }

  drop() {
    this.db.run('DROP TABLE IF EXISTS markers');
  }

  runMigration() {
    this.db.serialize(() => {
      this.db.run('DROP TABLE IF EXISTS markers');
      this.db.run(`CREATE TABLE markers (
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        label TEXT
      )`);
    });
  }

  getAllMarkers() {
    return new Promise((resolve, reject) => {
      try {
        this.db.all('SELECT rowid, * FROM markers', (_, rows = []) => {
          const markers = rows.map(({
            rowid: key, latitude, longitude, label,
          }) => ({
            key,
            longitude,
            latitude,
            label,
            local: false,
          }));
          resolve(markers);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  insertAndGetUpdatedMarkers(markers) {
    return new Promise((resolve, reject) => {
      if (markers.length === 0) {
        resolve([]);
      }
      try {
        this.db.serialize(() => {
          const newKeys = {};
          markers.forEach(({
            key, latitude, longitude, label,
          }, i) => {
            this.db.run(
              `INSERT INTO markers (latitude, longitude, label) VALUES ("${latitude}", "${longitude}", "${label}");`,
            );
            this.db.get('SELECT last_insert_rowid()', (_, rows) => {
              newKeys[key] = rows['last_insert_rowid()'];
              if (i === markers.length - 1) {
                resolve(
                  markers.map(marker => ({ ...marker, key: newKeys[marker.key], local: false })),
                );
              }
            });
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  updateMarkers(markers) {
    return new Promise((resolve, reject) => {
      if (markers.length === 0) {
        resolve([]);
      }
      try {
        this.db.serialize(() => {
          markers.forEach(({
            key, latitude, longitude, label,
          }, i) => {
            this.db.run(
              `UPDATE markers SET latitude = "${latitude}", longitude = "${longitude}", label = "${label}" WHERE rowid = ${key}`,
            );
            this.db.get('SELECT last_insert_rowid()', () => {
              if (i === markers.length - 1) {
                resolve(markers);
              }
            });
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  deleteOtherMarkers(markers) {
    return new Promise((resolve, reject) => {
      try {
        const markerKeys = markers.map(({ key }) => key);
        this.db.run(`DELETE FROM markers WHERE rowid NOT IN (${markerKeys.join()})`, () => {
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = SQLiteClient;
