package main

import (
	"fmt"
	"log"
	"one_dead/pkg/datastore"

	_ "github.com/gdamore/tcell/v2/encoding"
	"github.com/gliderlabs/ssh"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

var lobby *Lobby = NewLobby()
var playerDB *datastore.PlayerDB

func init() {
	var err error
	playerDB, err = datastore.NewPlayerDB("players.db")
	if err != nil {
		log.Fatalf("Failed to create player database: %v", err)
	}
}

func main() {
	ssh.Handle(func(sess ssh.Session) {
		// fetch player info
		player, err := playerDB.GetByName(sess.User())

		if err != nil || player == nil {
			fmt.Println("Creating new player")

			id, err := gonanoid.New()
			if err != nil {
				log.Fatalf("Failed to generate player ID: %v", err)
			}

			player = &datastore.Player{
				Id:   id,
				Name: sess.User(),
			}

			playerDB.Create(player)
		}

		gameSession := lobby.GetFreeSession(player)

		ui, err := NewChatUI(sess, player, gameSession)
		if err != nil {
			log.Fatalf("Failed to create UI: %v", err)
		}

		ui.Run()
	})
	fmt.Println("Starting server on port 2222...")
	log.Fatal(ssh.ListenAndServe(":2222", nil))
}
