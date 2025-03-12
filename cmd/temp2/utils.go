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
		size:    pi.Window,
		ch:      ch,
	}, ti)
	if err != nil {
		return nil, err
	}
	return screen, nil
}

func simulateConnection(ui *ChatUI) {
	// Simulate connection sequence
	time.Sleep(500 * time.Millisecond)

	ui.addSystem(Message{
		text:      "Initializing GoChat client v1.0.0...",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addSystem(Message{
		text:      "Loading configuration...",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addSystem(Message{
		text:      "Resolving server address...",
		timestamp: time.Now(),
	})
	time.Sleep(400 * time.Millisecond)

	ui.addServer(Message{
		text:      "Looking up chat.freenode.net...",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		text:      "Connecting to chat.freenode.net (IPv4)...",
		timestamp: time.Now(),
	})
	time.Sleep(500 * time.Millisecond)

	ui.addServer(Message{
		text:      "Connection established, authenticating...",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addWarning(Message{
		text:      "Server using TLS/SSL encryption",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addServer(Message{
		text:      "Requesting server capabilities...",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addSystem(Message{
		text:      "Server supports: multi-prefix extended-join account-notify batch away-notify",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addServer(Message{text: fmt.Sprintf("Logging in as %s...", ui.username), timestamp: time.Now()})
	time.Sleep(400 * time.Millisecond)

	ui.addServer(Message{
		text:      "Registration successful",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addSystem(Message{
		text:      "Your host is chat.freenode.net, running version ircd-seven-1.1.9",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		text:      "Welcome to the Freenode Internet Relay Chat Network",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addSystem(Message{text: fmt.Sprintf("Your username is %s and your hostname is local", ui.username), timestamp: time.Now()})
	time.Sleep(300 * time.Millisecond)

	ui.addServer(Message{
		text:      "MOTD: Message of the day",
		timestamp: time.Now(),
	})
	ui.addServer(Message{
		text:      "--------------------",
		timestamp: time.Now(),
	})
	ui.addServer(Message{
		text:      "Welcome to GoChat IRC Network",
		timestamp: time.Now(),
	})
	ui.addServer(Message{
		text:      "Current User's Login: " + ui.username,
		timestamp: time.Now(),
	})
	ui.addServer(Message{
		text:      "Enjoy your stay!",
		timestamp: time.Now(),
	})
	ui.addServer(Message{
		text:      "--------------------",
		timestamp: time.Now(),
	})
	time.Sleep(200 * time.Millisecond)

	ui.addSystem(Message{
		text:      "End of MOTD",
		timestamp: time.Now(),
	})
	time.Sleep(300 * time.Millisecond)

	ui.addSystem(Message{
		text:      "Connection complete - Start chatting!",
		timestamp: time.Now(),
	})

	ui.addSystem(Message{
		text:      "Enter your test code",
		timestamp: time.Now(),
	})

	uiC := ui.C.Subscribe("chat_message")
	defer close(uiC)
	<-uiC
	fmt.Println("Code received by", ui.username, "In chatui.go")

	lastMessage := ui.messages[len(ui.messages)-1]

	ui.gameSession.AddPlayer(&game.Player{
		Name: ui.username,
		Code: game.Code(lastMessage.text),
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
