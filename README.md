# Checkpoints Backend

A simple app to save and persist markers on a Google Map.

## Quick Start

### Run Project
1. `yarn install` or `npm install`
2. Run the migration: `yarn migrate` or `npm run migrate` (Optional if database already exists, this will erase everything on it)
3. `yarn start` or `npm run start`
4. Project should listen in `localhost:8080`

### Run tests
1. `yarn test` or `npm test`

## How I did it

It's a pretty straightforward backend service, it has two endpoints (GET /markers; POST /markers) that Get and Save the markers to the database.

It has no user authentication set up or anything like that, the database is just one table with a couple of fields to persist the data.

### Tech Stack
- `express` for server managing.
- `sqlite3` for the database.
- `jest` for testing.
