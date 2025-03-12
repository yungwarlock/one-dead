package main

import (
	"errors"
	"fmt"
	"one_dead/pkg/game"
	"time"

	"github.com/gdamore/tcell/v2"
	_ "github.com/gdamore/tcell/v2/encoding"
	"github.com/gdamore/tcell/v2/terminfo"
	"github.com/gliderlabs/ssh"
)

var logo []string = []string{
	"  .oooooo.",
	" d8P'  `Y8b",
	"888      888 ooo. .oo.    .ooooo.",
	"888      888 `888P'Y88b  d88' `88b",
	"888      888  888   888  888ooo888",
	"`88b    d88'  888   888  888    .o",
	" `Y8bood8P'  o888o o888o `Y8bod8P'",
	"",
	"oooooooooo.                             .o8",
	"`888'   `Y8b                           '888",
	" 888      888  .ooooo.   .oooo.    .oooo888",
	" 888      888 d88' `88b `P  )88b  d88' `888",
	" 888      888 888ooo888  .oP'888  888   888",
	" 888     d88' 888    .o d8(  888  888   888",
	"o888bood8P'   `Y8bod8P' `Y888''8o `Y8bod88P'",
	"",
}

func NewSessionScreen(s ssh.Session) (tcell.Screen, error) {
	pi, ch, ok := s.Pty()
	if !ok {
		return nil, errors.New("no pty requested")
	}
	ti, err := terminfo.LookupTerminfo(pi.Term)
	if err != nil {
		return nil, err
	}
	screen, err := tcell.NewTerminfoScreenFromTtyTerminfo(&tty{
		Session: s,
		ch:      ch,
		size:    pi.Window,
	}, ti)
	if err != nil {
		return nil, err
	}
	return screen, nil
}

func simulateConnection(ui *ChatUI) {
	ui.addSystem(Message{text: "", timestamp: time.Now()})

	for _, line := range logo {
		ui.addWarning(Message{
			text:      line,
			timestamp: time.Now(),
		})
		time.Sleep(50 * time.Millisecond)
	}

	time.Sleep(1500 * time.Millisecond)

	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "Welcome to One Dead: The strategic guessing game",
	})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		text:      "How to Play:",
		timestamp: time.Now(),
	})
	ui.addServer(Message{
		text:      "-------------",
		timestamp: time.Now(),
	})
	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "You and your opponent will each set a secret 4-digit code",
	})
	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "Your goal is to correctly guess the secret code of your opponent with the fewest number of guesses",
	})
	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "In the shortest amount of time",
	})
	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "You will be given two feedback values for each guess:",
	})
	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "1. The number of digits that are correct and in the correct position",
	})
	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "2. The number of digits that are correct but in the wrong position",
	})
	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "Good luck!",
	})
	time.Sleep(200 * time.Millisecond)

	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "This server is 2 months 3 weeks 6 days 5 hours 12 minutes 3 seconds old",
	})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "40 games in progress",
	})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		text:      "120 players online",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addSystem(Message{text: "", timestamp: time.Now()})

	ui.addWarning(Message{text: fmt.Sprintf("Logging in as %s...", ui.username), timestamp: time.Now()})
	time.Sleep(400 * time.Millisecond)

	ui.addServer(Message{
		timestamp: time.Now(),
		text:      "Your Stats:",
	})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		text:      "Games Played: 0",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addServer(Message{
		text:      "Games Won: 0",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addServer(Message{
		text:      "Games Lost: 0",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addSystem(Message{text: "", timestamp: time.Now()})

	ui.addServer(Message{
		text:      "Finding a game...",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		text:      "Adding you to a game...",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addSystem(Message{text: "", timestamp: time.Now()})
	time.Sleep(300 * time.Millisecond)

	ui.addWarning(Message{
		text:      "Enter your test code",
		timestamp: time.Now(),
	})

	uiC := ui.C.Subscribe()
	defer ui.C.Close(uiC)

	data := <-uiC

	ui.gameSession.AddPlayer(&game.Player{
		Name: ui.username,
		Code: game.Code(data.text),
	})

	ui.addWarning(Message{
		text:      "Now waiting for opponent to join...",
		timestamp: time.Now(),
	})

}

// Helper functions
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
