// Esegue init basilare del database in locale.
db = db.getSiblingDB('spa_viaggi');
db.createCollection('users');
db.createCollection('trips');
db.createCollection('trip_activities');
db.createCollection('trip_expenses');
db.createCollection('export_jobs');
