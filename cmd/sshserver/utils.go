package main

import (
	"io"

	"github.com/gliderlabs/ssh"
)

const (
	// Regular colors
	Black   = "\033[30m"
	Red     = "\033[31m"
	Green   = "\033[32m"
	Yellow  = "\033[33m"
	Blue    = "\033[34m"
	Magenta = "\033[35m"
	Cyan    = "\033[36m"
	White   = "\033[37m"
	Brown   = "\033[33m"
	Pink    = "\033[35m"
	Gray    = "\033[37m"
	Orange  = "\033[33m"
	Purple  = "\033[35m"
	Reset   = "\033[0m"

	// Bright colors
	BrightBlack   = "\033[90m"
	BrightRed     = "\033[91m"
	BrightGreen   = "\033[92m"
	BrightYellow  = "\033[93m"
	BrightBlue    = "\033[94m"
	BrightMagenta = "\033[95m"
	BrightCyan    = "\033[96m"
	BrightWhite   = "\033[97m"

	// Background colors
	BgBlack   = "\033[40m"
	BgRed     = "\033[41m"
	BgGreen   = "\033[42m"
	BgYellow  = "\033[43m"
	BgBlue    = "\033[44m"
	BgMagenta = "\033[45m"
	BgCyan    = "\033[46m"
	BgWhite   = "\033[47m"

	// Bold and underline
	Bold      = "\033[1m"
	Underline = "\033[4m"

	// Clear screen
	Clear = "\033[H\033[2J"

	// Reset to default colors
	ResetColor = "\033[39m\033[49m"

	// Reset to default styles
	ResetStyle = "\033[0m"

	// Reset all
	ResetAll = "\033[0m\033[39m\033[49m"

	// Hide cursor
	HideCursor = "\033[?25l"

	// Show cursor
	ShowCursor = "\033[?25h"
)

func setupScreen(s ssh.Session) {
	io.WriteString(s, Clear)

	// Top bar
	io.WriteString(s, BgBlue+White+"  One Dead "+BgBlack+Blue+"▐"+Reset+"\n")

	// Main content area with border
	io.WriteString(s, Blue+"┌─────────────────────────────────────────────┐"+Reset+"\n")
	io.WriteString(s, Blue+"│ "+Reset+BrightCyan+"Welcome to One Dead SSH Server"+Reset+Blue+"\t\t│"+Reset+"\n")
	io.WriteString(s, Blue+"│ "+Reset+Green+"User: "+White+s.User()+Reset+Blue+"\t│"+Reset+"\n")
	io.WriteString(s, Blue+"│ "+Reset+Yellow+"Type 'help' for available commands"+Reset+Blue+"\t│"+Reset+"\n")
	io.WriteString(s, Blue+"└─────────────────────────────────────────────┘"+Reset+"\n")

	// Status line
	io.WriteString(s, BgBlue+White+"[Status] Connected"+BgBlack+Blue+"▐"+Reset+"\n")
}
