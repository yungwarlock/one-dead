package game

import "testing"

func TestValidateCodeIsNotFourDigits(t *testing.T) {

	code := Code("12345")
	err := validateCode(code)

	if err == nil {
		t.Errorf("Did not fail for 5 digit number")
	}

}

func TestValidateCodeIsFourDigits(t *testing.T) {

	code := Code("1234")
	err := validateCode(code)

	if err != nil {
		t.Errorf("Failed for 4 digit number")
	}
}

func TestValidateCodeContainsRepeatingDigit(t *testing.T) {

	code := Code("1134")
	err := validateCode(code)

	if err == nil {
		t.Errorf("Did not fail for repeating digits")
	}
}

func TestValidateCodeDoesNotContainRepeatingDigit(t *testing.T) {

	code := Code("1934")
	err := validateCode(code)

	if err != nil {
		t.Errorf("Failed with no repeating digits")
	}
}
