package game

type Lobby struct {
	Sessions map[uint16]*Session
}

func NewLobby() *Lobby {
	return &Lobby{
		Sessions: make(map[uint16]*Session),
	}
}

func (l *Lobby) AddSession(session *Session) {
	l.Sessions[session.Id] = session
}

func (l *Lobby) GetFreeSession() *Session {
	var session *Session

	for _, value := range l.Sessions {
		if !value.IsReady() {
			session = value
			break
		}
	}

	if session == nil {
		id := GenerateRandomNumber()
		session = NewSession(id)
		l.AddSession(session)
	}

	return session
}

func (l *Lobby) GetSession(id uint16) *Session {
	return l.Sessions[id]
}

func (l *Lobby) RemoveSession(id uint16) {
	delete(l.Sessions, id)
}
