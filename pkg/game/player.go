package game

type Player struct {
	Name string
	Code Code
}

func NewPlayer(name string, code Code) *Player {
	validateCode(code)
	return &Player{
		Name: name,
		Code: code,
	}
}
