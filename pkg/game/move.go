package game

type Trial struct {
	MainCode Code
	TestCode Code
	Period   uint16
	Player   *Player
}

func (m *Trial) isWinningTry() bool {
	dead, injured := m.Results()
	if dead == 4 && injured == 0 {
		return true
	}
	return false
}

func (m *Trial) Results() (uint16, uint16) {
	var testCode []string
	var mainCode []string

	var deadCount uint16
	var injuredCount uint16

	for _, digit := range m.MainCode {
		mainCode = append(mainCode, string(digit))
	}

	for _, digit := range m.TestCode {
		testCode = append(testCode, string(digit))
	}

	for i := 0; i < 4; i++ {
		if testCode[i] == mainCode[i] {
			deadCount += 1
			continue
		}

		for j := 0; j < 4; j++ {
			if testCode[i] == mainCode[j] {
				injuredCount += 1
			}
		}

	}
	return deadCount, injuredCount
}
