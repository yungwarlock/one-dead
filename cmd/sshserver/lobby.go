package main

import (
	"one_dead/pkg/datastore"
	"one_dead/pkg/game"
	"sync"
)

type Candidate struct {
	Session *game.Session
	Members []*datastore.Player
}

type Lobby struct {
	sync.RWMutex
	Candidates map[uint16]*Candidate
}

func NewLobby() *Lobby {
	return &Lobby{
		Candidates: make(map[uint16]*Candidate),
	}
}

func (l *Lobby) AddSession(session *game.Session) *Candidate {
	l.Lock()
	defer l.Unlock()

	candidate := &Candidate{
		Session: session,
		Members: []*datastore.Player{},
	}
	l.Candidates[session.Id] = candidate
	return candidate
}

func (l *Lobby) GetFreeSession(player *datastore.Player) *game.Session {
	l.Lock()
	defer l.Unlock()

	var session *game.Session

	for _, candidate := range l.Candidates {
		if len(candidate.Members) != 2 {
			session = candidate.Session
			candidate.Members = append(candidate.Members, player)
			break
		}
	}

	if session == nil {
		id := game.GenerateRandomNumber()
		session = game.NewSession(id)
		candidate := &Candidate{
			Session: session,
			Members: []*datastore.Player{player},
		}
		l.Candidates[id] = candidate
	}

	return session
}

func (l *Lobby) GetSession(id uint16) *game.Session {
	l.RLock()
	defer l.RUnlock()

	if candidate, ok := l.Candidates[id]; ok {
		return candidate.Session
	}
	return nil
}

func (l *Lobby) RemoveSession(id uint16) {
	l.Lock()
	defer l.Unlock()

	delete(l.Candidates, id)
}
