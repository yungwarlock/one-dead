package main

import (
	"fmt"
	"one_dead/pkg/game"
	"one_dead/pkg/pubsub"
	"os"
	"time"

	"github.com/gdamore/tcell/v2"
	_ "github.com/gdamore/tcell/v2/encoding"
	"github.com/gliderlabs/ssh"
)

// Define a new Message type to store the text and color of a message

type TextPart struct {
	text string
	bold bool
}

type Message struct {
	text      string
	parts     []TextPart
	color     tcell.Color
	timestamp time.Time
}

// Update ChatUI struct to use the new Message type
type ChatUI struct {
	C            *pubsub.PubSub[Message]
	screen       tcell.Screen
	messages     []Message
	inputBuffer  string
	inputStartX  int
	inputStartY  int
	currentStyle tcell.Style
	username     string
	startTime    time.Time
	scrollOffset int
	gameSession  *game.Session
}

func NewChatUI(s ssh.Session, gameSession *game.Session) (*ChatUI, error) {
	screen, err := NewSessionScreen(s)
	if err != nil {
		return nil, fmt.Errorf("failed to create screen: %v", err)
	}

	if err := screen.Init(); err != nil {
		return nil, fmt.Errorf("failed to initialize screen: %v", err)
	}

	defaultStyle := tcell.StyleDefault.
		Background(tcell.ColorBlack).
		Foreground(tcell.ColorWhite)

	screen.SetStyle(defaultStyle)
	width, _ := screen.Size()

	return &ChatUI{
		C:            pubsub.NewPubSub[Message](),
		screen:       screen,
		messages:     []Message{},
		inputBuffer:  "",
		inputStartX:  0,
		inputStartY:  width,
		currentStyle: defaultStyle,
		username:     s.User(),
		startTime:    time.Now(),
		scrollOffset: 0,
		gameSession:  gameSession,
	}, nil
}

// Helper function to add system messages with timestamp
func (ui *ChatUI) addSystem(msg Message) {
	timestamp := msg.timestamp.Format("15:04:05")
	ui.addMessage(fmt.Sprintf("[%s] %s", timestamp, msg.text), tcell.ColorGray)
}

// Helper function to add server messages
func (ui *ChatUI) addServer(msg Message) {
	timestamp := msg.timestamp.Format("15:04:05")
	ui.addMessage(fmt.Sprintf("[%s] * %s", timestamp, msg.text), tcell.ColorLightGreen)
}

// Helper function to add error/warning messages
func (ui *ChatUI) addWarning(msg Message) {
	timestamp := msg.timestamp.Format("15:04:05")
	ui.addMessage(fmt.Sprintf("[%s] ! %s", timestamp, msg.text), tcell.ColorOrange)
}

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
			} else if message.Type == game.JOIN && message.Player.Name != ui.username {
				ui.addServer(Message{
					text:      fmt.Sprintf("Player %s joined", message.Player.Name),
					timestamp: time.Now(),
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
					ui.addMessage(fmt.Sprintf("[%s] <%s> %s", timestamp, ui.username, ui.inputBuffer), tcell.ColorWhite)

					if ui.gameSession.Status == game.ACTIVE {
						ui.gameSession.AddTrial(ui.username, game.Code(ui.inputBuffer))
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

func (ui *ChatUI) drawTopBar() {
	width, _ := ui.screen.Size()
	topBarStyle := ui.currentStyle.Background(tcell.ColorNavy).Foreground(tcell.ColorWhite)

	// Clear the top bar
	for x := 0; x < width; x++ {
		ui.screen.SetContent(x, 0, ' ', nil, topBarStyle)
	}

	tries := 4
	currentDuration := time.Now().UTC().Format("15:04")

	topBarText := fmt.Sprintf(
		"One Dead: A strategic guessing game. Current Tries: %d. Current Duration: %s. Play at https://one-dead.web.app",
		tries,
		currentDuration,
	)

	// Draw first line of the top bar
	for x, ch := range topBarText {
		if x >= width {
			break
		}
		ui.screen.SetContent(x, 0, ch, nil, topBarStyle)
	}
}

func (ui *ChatUI) addMessage(msg string, color tcell.Color) {
	ui.messages = append(ui.messages, Message{
		text:      msg,
		color:     color,
		timestamp: time.Now(),
	})
}

// Add a new method for styled messages
func (ui *ChatUI) addStyledMessage(parts []TextPart, color tcell.Color, timestamp time.Time) {
	partsWithPrefix := append([]TextPart{
		{
			bold: false,
			text: fmt.Sprintf("[%s] ", timestamp.Format("15:04:05")),
		},
	}, parts...)
	ui.messages = append(ui.messages, Message{
		color:     color,
		timestamp: time.Now(),
		parts:     partsWithPrefix,
	})
}

func (ui *ChatUI) draw() {
	ui.screen.Clear()
	width, height := ui.screen.Size()

	// Draw top bar
	ui.drawTopBar()

	// Calculate visible message area
	messageArea := height - 3 // -2 for top bar, -1 for input line

	// Calculate the range of messages to display
	endIdx := len(ui.messages) - ui.scrollOffset
	startIdx := max(0, endIdx-messageArea)
	endIdx = min(len(ui.messages), startIdx+messageArea)

	// Draw messages (starting from line 2 due to 2-line top bar)
	for i := 0; i < messageArea && startIdx+i < endIdx; i++ {
		msg := ui.messages[startIdx+i]
		style := ui.currentStyle.Foreground(msg.color)

		if msg.parts != nil {
			x := 0
			for _, part := range msg.parts {
				style := ui.currentStyle.Foreground(msg.color)
				if part.bold {
					style = style.Bold(true)
				}

				for _, ch := range part.text {
					if x >= width {
						break
					}
					ui.screen.SetContent(x, i+2, ch, nil, style)
					x++
				}
			}
		} else {
			for x, ch := range msg.text {
				if x >= width {
					break
				}
				ui.screen.SetContent(x, i+2, ch, nil, style)
			}
		}
	}

	// Draw input area with colored background and prompt
	inputStyle := tcell.StyleDefault.
		Background(tcell.ColorDarkBlue).
		Foreground(tcell.ColorWhite)

	promptStyle := tcell.StyleDefault.
		Background(tcell.ColorDarkBlue).
		Foreground(tcell.ColorLightGreen).
		Bold(true)

	// Draw input background
	for x := 0; x < width; x++ {
		ui.screen.SetContent(x, ui.inputStartY, ' ', nil, inputStyle)
	}

	// Draw prompt
	prompt := ">> "
	for x, ch := range prompt {
		ui.screen.SetContent(x, ui.inputStartY, ch, nil, promptStyle)
	}

	// Draw input text
	for x, ch := range ui.inputBuffer {
		if x+len(prompt) >= width {
			break
		}
		ui.screen.SetContent(x+len(prompt), ui.inputStartY, ch, nil, inputStyle)
	}

	// Position cursor after the prompt
	ui.screen.ShowCursor(len(prompt)+len(ui.inputBuffer), ui.inputStartY)
}
