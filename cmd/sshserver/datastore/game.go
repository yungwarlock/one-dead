package datastore

import "fmt"

func (pdb *PlayerDB) SaveGame(game *Game) error {
	_, err := pdb.db.Exec(`
INSERT OR REPLACE INTO games
(id, player_id, tries, duration, date)
VALUES (?, ?, ?, ?, ?)
`,
		game.Id, game.PlayerId, game.Tries, game.Duration, game.Date,
	)
	if err != nil {
		return fmt.Errorf("error saving game: %v", err)
	}
	return nil
}

func (pdb *PlayerDB) GetGamesByPlayerId(playerId string) ([]*Game, error) {
	rows, err := pdb.db.Query(`
SELECT
id, player_id, tries, duration, date
FROM games
WHERE player_id = ?
`, playerId)
	if err != nil {
		return nil, fmt.Errorf("error querying games: %v", err)
	}

	defer rows.Close()

	var games []*Game

	for rows.Next() {
		game := &Game{}
		err := rows.Scan(&game.Id, &game.PlayerId, &game.Tries, &game.Duration, &game.Date)
		if err != nil {
			return nil, fmt.Errorf("error scanning game: %v", err)
		}
		games = append(games, game)
	}

	return games, nil
}
