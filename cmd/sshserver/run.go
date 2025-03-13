package main

import (
	"fmt"
	"one_dead/pkg/datastore"
	"one_dead/pkg/game"
	"os"
	"time"

	"github.com/gdamore/tcell/v2"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

func (ui *ChatUI) Run() {
	// Create a ticker for updating the top bar (updates every second)
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	// Create a channel for the ticker
	go func() {
		for range ticker.C {
			ui.draw()
			ui.screen.Show()
		}
	}()

	go func() {
		gameC := ui.gameSession.Events.Subscribe()
		defer func() {
			ui.gameSession.Events.Close(gameC)
			fmt.Println("Unsubscribed from player_joined")
		}()

		for message := range gameC {
			if message.Type == game.START {
				ui.addServer(Message{
					text:      "Game started",
					timestamp: time.Now(),
				})
			} else if message.Type == game.END {
				ui.addServer(Message{
					text:      fmt.Sprintf("Game is won by %s", message.Player.Name),
					timestamp: time.Now(),
				})

				id, err := gonanoid.New()
				if err != nil {
					fmt.Println("Failed to generate game ID")
				}

				hasWon := ui.gameSession.Winner.Name == ui.player.Name
				playerDB.SaveGame(&datastore.Game{
					Id:       id,
					PlayerId: ui.player.Id,
					Tries:    len(ui.gameSession.Tries),
					Duration: 5,
					Date:     time.Now(),
					Won:      hasWon,
				})
			} else if message.Type == game.JOIN && message.Player.Name != ui.player.Name {
				ui.addServer(Message{
					timestamp: time.Now(),
					text:      fmt.Sprintf("Player %s joined", message.Player.Name),
				})
			} else if message.Type == game.TRY {
				ui.addServer(Message{
					text: fmt.Sprintf("[TRY][%s] %s => %d dead, %d injured",
						message.Player.Name,
						message.Code,
						message.Result.Dead,
						message.Result.Injured,
					),
					timestamp: time.Now(),
				})
			}
		}
	}()

	ui.draw()
	ui.screen.Show()
	go simulateConnection(ui)

	for {
		ui.draw()
		ui.screen.Show()

		ev := ui.screen.PollEvent()

		switch ev := ev.(type) {
		case *tcell.EventKey:
			switch ev.Key() {
			case tcell.KeyCtrlC:
				ui.screen.Fini()
				os.Exit(0)
			case tcell.KeyEnter:
				if ui.inputBuffer != "" {
					timestamp := time.Now().UTC().Format("15:04:05")
					ui.C.Publish(Message{
						text:      ui.inputBuffer,
						color:     tcell.ColorWhite,
						timestamp: time.Now(),
					})
					ui.addMessage(fmt.Sprintf("[%s] <%s> %s", timestamp, ui.player.Name, ui.inputBuffer), tcell.ColorWhite)

					if ui.gameSession.Status == game.ACTIVE {
						ui.gameSession.AddTrial(ui.player.Name, game.Code(ui.inputBuffer))
					}

					ui.inputBuffer = ""
					ui.scrollOffset = 0
				}
			case tcell.KeyBackspace, tcell.KeyBackspace2:
				if len(ui.inputBuffer) > 0 {
					ui.inputBuffer = ui.inputBuffer[:len(ui.inputBuffer)-1]
				}
			case tcell.KeyPgUp:
				_, height := ui.screen.Size()
				maxScroll := len(ui.messages) - (height - 2)
				if maxScroll < 0 {
					maxScroll = 0
				}
				ui.scrollOffset = min(maxScroll, ui.scrollOffset+3)
			case tcell.KeyPgDn:
				ui.scrollOffset = max(0, ui.scrollOffset-3)
			case tcell.KeyRune:
				ui.inputBuffer += string(ev.Rune())
			}
		case *tcell.EventResize:
			ui.screen.Sync()
			_, height := ui.screen.Size()
			ui.inputStartY = height - 1
		}
	}
}
