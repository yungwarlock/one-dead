package datastore

import (
	"database/sql"
	"time"
)

type Player struct {
	Id   string
	Name string
}

type Game struct {
	Id       string
	PlayerId string
	Tries    int
	Duration int
	Won      bool
	Date     time.Time
}

// PlayerDB handles database operations for players
type PlayerDB struct {
	db *sql.DB
}
