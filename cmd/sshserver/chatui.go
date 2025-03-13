package main

import (
	"fmt"
	"one_dead/pkg/datastore"
	"one_dead/pkg/game"
	"one_dead/pkg/pubsub"
	"time"

	"github.com/gdamore/tcell/v2"
	_ "github.com/gdamore/tcell/v2/encoding"
	"github.com/gliderlabs/ssh"
)

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
	player       *datastore.Player
	startTime    time.Time
	scrollOffset int
	gameSession  *game.Session
}

func NewChatUI(s ssh.Session, player *datastore.Player, gameSession *game.Session) (*ChatUI, error) {
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
		player:       player,
		startTime:    time.Now(),
		scrollOffset: 0,
		gameSession:  gameSession,
	}, nil
}

// Helper function to add system messages with timestamp
func (ui *ChatUI) addSystem(msg Message) {
	timestamp := msg.timestamp.Format("15:04:05")

	if msg.parts != nil {
		partsWithPrefix := append([]TextPart{
			{
				bold: false,
				text: fmt.Sprintf("%s -!- ", timestamp),
			},
		}, msg.parts...)
		ui.addStyledMessage(partsWithPrefix, tcell.ColorTurquoise, msg.timestamp)
	} else {
		ui.addMessage(fmt.Sprintf("%s -!- %s", timestamp, msg.text), tcell.ColorTurquoise)
	}
}

// Helper function to add server messages
func (ui *ChatUI) addServer(msg Message) {
	timestamp := msg.timestamp.Format("15:04:05")

	if msg.parts != nil {
		partsWithPrefix := append([]TextPart{
			{
				bold: false,
				text: fmt.Sprintf("%s -!- ", timestamp),
			},
		}, msg.parts...)
		ui.addStyledMessage(partsWithPrefix, tcell.ColorLightGreen, msg.timestamp)
	} else {
		ui.addMessage(fmt.Sprintf("%s -!- %s", timestamp, msg.text), tcell.ColorLightGreen)
	}
}

// Helper function to add error/warning messages
func (ui *ChatUI) addWarning(msg Message) {
	timestamp := msg.timestamp.Format("15:04:05")

	if msg.parts != nil {
		partsWithPrefix := append([]TextPart{
			{
				bold: false,
				text: fmt.Sprintf("%s ! ", timestamp),
			},
		}, msg.parts...)
		ui.addStyledMessage(partsWithPrefix, tcell.ColorOrange, msg.timestamp)
	} else {
		ui.addMessage(fmt.Sprintf("%s ! %s", timestamp, msg.text), tcell.ColorOrange)
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
	ui.messages = append(ui.messages, Message{
		parts:     parts,
		color:     color,
		timestamp: timestamp,
	})
}

func (ui *ChatUI) drawTopBar() {
	width, _ := ui.screen.Size()
	topBarStyle := ui.currentStyle.Background(tcell.ColorNavy).Foreground(tcell.ColorWhite)

	// Clear the top bar
	for x := 0; x < width; x++ {
		ui.screen.SetContent(x, 0, ' ', nil, topBarStyle)
	}

	tries := 4
	currentDuration := time.Now().UTC().Format("15:04:05")

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

func (ui *ChatUI) drawPromptBar() {
	width, _ := ui.screen.Size()

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

func (ui *ChatUI) draw() {
	ui.screen.Clear()
	width, height := ui.screen.Size()

	// Draw top bar
	ui.drawTopBar()
	ui.drawPromptBar()

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
}
