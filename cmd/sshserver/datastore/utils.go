package datastore

import (
	"database/sql"
	"fmt"
)

var playersSchema string = `
CREATE TABLE IF NOT EXISTS players (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL
)`

var gamesSchema string = `
CREATE TABLE IF NOT EXISTS games (
	id TEXT PRIMARY KEY,
	player_id TEXT NOT NULL REFERENCES players(id),
	tries INTEGER NOT NULL,
	duration INTEGER NOT NULL,
	date TEXT NOT NULL
)`

// NewPlayerDB creates a new PlayerDB instance
func NewPlayerDB(dbPath string) (*PlayerDB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %v", err)
	}

	// Create table if it doesn't exist
	_, err = db.Exec(playersSchema)
	if err != nil {
		return nil, fmt.Errorf("error creating table: %v", err)
	}

	_, err = db.Exec(gamesSchema)
	if err != nil {
		return nil, fmt.Errorf("error creating table: %v", err)
	}

	return &PlayerDB{db: db}, nil
}
