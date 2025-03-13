package datastore

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// Save stores a player in the database
func (pdb *PlayerDB) Save(player *Player) error {
	_, err := pdb.db.Exec(
		"INSERT OR REPLACE INTO players (id, name) VALUES (?, ?)",
		player.Id, player.Name,
	)
	if err != nil {
		return fmt.Errorf("error saving player: %v", err)
	}
	return nil
}

// Create new player
func (pdb *PlayerDB) Create(player *Player) error {
	_, err := pdb.db.Exec(
		"INSERT INTO players (id, name) VALUES (?, ?)",
		player.Id, player.Name,
	)
	if err != nil {
		return fmt.Errorf("error creating player: %v", err)
	}
	return nil
}

// GetByName retrieves a player by their name
func (pdb *PlayerDB) GetByName(name string) (*Player, error) {
	player := &Player{}
	err := pdb.db.QueryRow(
		"SELECT id, name FROM players WHERE name = ?",
		name,
	).Scan(&player.Id, &player.Name)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, fmt.Errorf("error getting player: %v", err)
	}

	return player, nil
}

// GetByID retrieves a player by their ID
func (pdb *PlayerDB) GetByID(id string) (*Player, error) {
	player := &Player{}
	err := pdb.db.QueryRow(
		"SELECT id, name FROM players WHERE id = ?",
		id,
	).Scan(&player.Id, &player.Name)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error getting player: %v", err)
	}
	return player, nil
}

// GetAll retrieves all players from the database
func (pdb *PlayerDB) GetAll() ([]*Player, error) {
	rows, err := pdb.db.Query("SELECT id, name FROM players")
	if err != nil {
		return nil, fmt.Errorf("error querying players: %v", err)
	}
	defer rows.Close()

	var players []*Player
	for rows.Next() {
		player := &Player{}
		err := rows.Scan(&player.Id, &player.Name)
		if err != nil {
			return nil, fmt.Errorf("error scanning player: %v", err)
		}
		players = append(players, player)
	}
	return players, nil
}

// Close closes the database connection
func (pdb *PlayerDB) Close() error {
	return pdb.db.Close()
}

func Example() {
	// Create a new PlayerDB instance
	playerDB, err := NewPlayerDB("./players.db")
	if err != nil {
		panic(err)
	}
	defer playerDB.Close()

	// Create a new player
	player := &Player{
		Id:   "player1",
		Name: "John Doe",
	}

	// Save the player
	if err := playerDB.Save(player); err != nil {
		panic(err)
	}

	// Retrieve the player
	retrieved, err := playerDB.GetByID("player1")
	if err != nil {
		panic(err)
	}
	fmt.Printf("Retrieved player: %+v\n", retrieved)

	// Get all players
	allPlayers, err := playerDB.GetAll()
	if err != nil {
		panic(err)
	}
	fmt.Printf("All players: %+v\n", allPlayers)
}
