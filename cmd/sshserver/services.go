package main

import (
	"fmt"
	"net/http"

	"one_dead/pkg/game"
)

func CreateGame(w http.ResponseWriter, r *http.Request) {
	session := game.CreateGame()
	player := game.CreatePlayer(session, "Damian", "1234")

	AddGameToWaitingArea(session)

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Session id:%d\nPlayer name %s", session.Id, player.Name)
}

func ListGames(w http.ResponseWriter, r *http.Request) {
	games := ListGamesInWaitingArea()

	w.WriteHeader(http.StatusOK)
	for _, game := range games {
		fmt.Fprintf(w, "Session id:%d\n", game.Id)
	}
}

// Join a game
func JoinGame(w http.ResponseWriter, r *http.Request) {

	session, err := PopGameFromWaitingArea()
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintln(w, err)
		return
	}
	player := game.CreatePlayer(session, "Damian", "1234")

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Session id:%d\nPlayer name %s", session.Id, player.Name)
}
