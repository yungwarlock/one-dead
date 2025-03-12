package main

import (
	"fmt"
	"sync"

	"one_dead/pkg/game"
)

var mu sync.Mutex
var games []*game.Session = []*game.Session{}

func AddGameToWaitingArea(game *game.Session) {
	mu.Lock()
	defer mu.Unlock()

	games = append(games, game)
}

func ListGamesInWaitingArea() []*game.Session {
	return games
}

func PopGameFromWaitingArea() (*game.Session, error) {
	mu.Lock()
	defer mu.Unlock()

	if len(games) == 0 {
		return nil, fmt.Errorf("empty waiting area")
	}

	game := games[len(games)-1]
	if game == nil {
		return nil, fmt.Errorf("empty waiting area")
	}
	games = games[:len(games)-1]

	return game, nil
}
