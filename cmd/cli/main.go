package main

import (
	"fmt"
	"log"

	"one_dead/pkg/game"
)

// Greeting
func greeting() {
	fmt.Println("RandomPy v0.0")
}

var Name string

// Collect user info
func collectUserInfo() {
	fmt.Printf("Enter your name:\n>: ")
	fmt.Scanf("%s", &Name)
}

// Start main loop
func MainLoop() {
	id := game.GenerateRandomNumber()
	session := game.NewSession(id, 0, 0)
	compCode := game.GenerateRandomCode()

	log.Printf("Compcode: %s", compCode)

	player1 := game.CreatePlayer(session, Name, compCode)

	// Computer
	game.CreatePlayer(session, "Computer", compCode)

	session.Start()

	for {
		if session.IsEnded() {
			fmt.Println("Ended")
			break
		}

		var testCode game.Code
		fmt.Print("Enter your testCode:\n>: ")
		fmt.Scanf("%s ", &testCode)

		res := session.TryMove(player1.Id, testCode)
		dead, injured := res.Results()
		fmt.Printf("%d dead, %d injured\n", dead, injured)
	}

}

// Ending

func main() {
	greeting()
	collectUserInfo()
	MainLoop()
}
