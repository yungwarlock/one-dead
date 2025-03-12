package game

import (
	"one_dead/pkg/pubsub"
	"time"
)

type Code string

type Session struct {
	Id uint16

	startTime uint16
	endTime   uint16
	winner    *Player
	tries     map[uint16]*Trial
	players   map[string]*Player

	Events *pubsub.PubSub
}

func NewSession(id uint16,

// startTime, endTime uint16,
) *Session {

	tries := make(map[uint16]*Trial)
	players := make(map[string]*Player)

	return &Session{
		Id: id,
		// startTime: startTime,
		// endTime:   endTime,
		winner:  nil,
		tries:   tries,
		players: players,
		Events:  pubsub.NewPubSub(),
	}
}

func (s *Session) AddPlayer(player *Player) {
	if !s.IsReady() {
		s.players[player.Name] = player
		s.Events.Publish("player_joined", player.Name)
	} else {
		panic("Player's count exceeded")
	}
}

func (s *Session) Start() {
	if !s.IsReady() {
		panic("Game not ready to start")
	}

	s.startTime = uint16(time.Now().Unix())
}

func (s *Session) End() {
	s.endTime = s.getCurrentPeriod()
}

func (s *Session) AddTrial(Name string, code Code) *Trial {
	validateCode(code)
	if !s.IsStarted() {
		panic("Game not started")
	}

	if s.IsEnded() {
		panic("Game already ended")
	}

	period := s.getCurrentPeriod()
	player, ok := s.players[Name]
	if !ok {
		panic("Player not found")
	}

	var opponent *Player
	for name, player := range s.players {
		if name != Name {
			opponent = player
		}
	}

	trial := &Trial{
		MainCode: opponent.Code,
		TestCode: code,
		Period:   period,
		Player:   player,
	}

	if trial.isWinningTry() {
		s.winner = player
		s.End()
	}

	s.Events.Publish("trial", trial)
	s.tries[period] = trial

	return trial
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
	for _, v := range s.players {
		allPlayers = append(allPlayers, v)
	}

	return len(allPlayers) == maxPlayers
}

func (s *Session) IsStarted() bool {
	return s.startTime != 0
}

func (s *Session) IsEnded() bool {
	return s.endTime != 0
}
