const SQLiteClient = require('./clients/SQLiteClient');

const client = new SQLiteClient();
client.runMigration();
client.close();
