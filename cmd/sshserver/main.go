package main

import (
	"fmt"
	"io"
	"log"

	"github.com/gliderlabs/ssh"

	"golang.org/x/term"
)

func main() {
	ssh.Handle(func(s ssh.Session) {
		term := term.NewTerminal(s, "> ")

		setupScreen(s)

		for {
			line, err := term.ReadLine()
			if err != nil {
				if err == io.EOF {
					break
				}
				io.WriteString(s, fmt.Sprintf("Error: %v\n", err))
				continue
			}
			switch line {
			case "up":
				io.WriteString(s, "I have gone up\n")
			case "down":
				io.WriteString(s, "I have gone down\n")
			case "quit":
				io.WriteString(s, "Goodbye!\n")
				return
			default:
				io.WriteString(s, fmt.Sprintf("Unknown command: %s\n", line))
			}
		}
	})

	log.Println("starting ssh server on port 2222...")
	log.Fatal(ssh.ListenAndServe(":2222", nil))
}
