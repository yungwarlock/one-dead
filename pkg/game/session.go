package game

import (
	"fmt"
	"one_dead/pkg/pubsub"
	"time"
)

type Status string

const (
	ENDED   Status = "ended"
	ACTIVE  Status = "active"
	PENDING Status = "pending"
)

const (
	TRY   string = "try"
	END   string = "end"
	JOIN  string = "join"
	START string = "start"
)

type Code string

type SessionMessage struct {
	Code   Code
	Type   string
	Player *Player
	Result *Result
}

type Result struct {
	Dead    uint16
	Injured uint16
}

type Trial struct {
	MainCode Code
	TestCode Code
	Period   uint16
	Player   *Player
}

type Session struct {
	Id uint16

	startTime uint16
	endTime   uint16
	Status    Status
	Winner    *Player
	Tries     map[uint16]*Trial
	Players   map[string]*Player

	Events *pubsub.PubSub[SessionMessage]
}

func NewSession(id uint16) *Session {
	tries := make(map[uint16]*Trial)
	players := make(map[string]*Player)

	return &Session{
		Id:      id,
		Winner:  nil,
		Tries:   tries,
		Players: players,
		Status:  PENDING,
		Events:  pubsub.NewPubSub[SessionMessage](),
	}
}

func (s *Session) AddPlayer(player *Player) {
	if !s.IsReady() {
		s.Players[player.Name] = player
		s.Events.Publish(SessionMessage{
			Type:   JOIN,
			Player: player,
		})

		if s.IsReady() {
			s.Start()
			s.Events.Publish(SessionMessage{
				Type: START,
			})
		}

	} else {
		panic("Player's count exceeded")
	}
}

func (s *Session) Start() {
	if !s.IsReady() {
		panic("Game not ready to start")
	}

	s.startTime = uint16(time.Now().Unix())
	s.Status = ACTIVE
}

func (s *Session) End(winner *Player) {
	s.endTime = s.getCurrentPeriod()
	s.Status = ENDED
	s.Events.Publish(SessionMessage{
		Type:   END,
		Player: winner,
	})
}

func (s *Session) AddTrial(Name string, code Code) {
	validateCode(code)
	if s.Status != ACTIVE {
		panic("Game not started")
	}

	period := s.getCurrentPeriod()
	player, ok := s.Players[Name]
	if !ok {
		panic("Player not found")
	}

	var opponent *Player
	for name, player := range s.Players {
		if name != Name {
			opponent = player
		}
	}

	res := s.getResults(code, opponent.Code)
	if res.Dead == 4 && res.Injured == 0 {
		s.Winner = player
		s.End(player)
	}

	trial := &Trial{
		TestCode: code,
		Period:   period,
		Player:   player,
		MainCode: opponent.Code,
	}

	s.Events.Publish(SessionMessage{
		Type:   TRY,
		Code:   code,
		Player: player,
		Result: res,
	})
	s.Tries[period] = trial
}

func (s *Session) getResults(code Code, opponent Code) *Result {
	var testCode []string
	var mainCode []string

	result := &Result{
		Dead:    0,
		Injured: 0,
	}

	fmt.Println("MainCode", code)
	fmt.Println("TestCode", opponent)

	for _, digit := range code {
		mainCode = append(mainCode, string(digit))
	}

	for _, digit := range opponent {
		testCode = append(testCode, string(digit))
	}

	fmt.Println("MainCode", mainCode)
	fmt.Println("TestCode", testCode)

	for i := 0; i < 4; i++ {
		if testCode[i] == mainCode[i] {
			result.Dead += 1
			continue
		}

		for j := 0; j < 4; j++ {
			if testCode[i] == mainCode[j] {
				result.Injured += 1
			}
		}
	}
	return result
}

func (s *Session) getCurrentPeriod() uint16 {
	if s.endTime != 0 {
		return s.endTime
	}

	currentTime := uint16(time.Now().Unix())
	totalTime := currentTime - uint16(s.startTime)
	return totalTime
}

func (s *Session) IsReady() bool {
	maxPlayers := 2

	allPlayers := []*Player{}
	for _, v := range s.Players {
		allPlayers = append(allPlayers, v)
	}

	return len(allPlayers) == maxPlayers
}
