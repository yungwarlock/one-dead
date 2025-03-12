package main

import (
	"fmt"
	"log"
	"one_dead/pkg/game"

	_ "github.com/gdamore/tcell/v2/encoding"
	"github.com/gliderlabs/ssh"
)

var lobby *game.Lobby = game.NewLobby()

func main() {
	ssh.Handle(func(sess ssh.Session) {
		gameSession := lobby.GetFreeSession()

		ui, err := NewChatUI(sess, gameSession)
		if err != nil {
			log.Fatalf("Failed to create UI: %v", err)
		}

		ui.Run()
	})
	fmt.Println("Starting server on port 2222...")
	log.Fatal(ssh.ListenAndServe(":2222", nil))
}
