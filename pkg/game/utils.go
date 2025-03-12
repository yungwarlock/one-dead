package game

import (
	"fmt"
	"math/rand"
)

func GenerateRandomNumber() uint16 {
	return uint16(rand.Float32() * 1000)
}

func validateCode(code Code) error {
	var count int
	var codeSlice []string

	for _, digit := range code {
		count++
		codeSlice = append(codeSlice, fmt.Sprint(digit))
	}

	if count != 4 {
		return fmt.Errorf("Code is not 4 digits")
	}

	all := map[string]string{}

	for _, digit := range codeSlice {
		err := fmt.Errorf("Code contains repeating number %s", digit)
		if _, ok := all[digit]; ok {
			return err
		}
		all[digit] = digit
	}

	return nil
}
