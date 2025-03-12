package game

import (
	"reflect"
	"testing"
)

func TestSplit(t *testing.T) {
	type test struct {
		mainCode Code
		testCode Code
		want     []uint16
	}

	tests := []test{
		{mainCode: Code("1234"), testCode: Code("1234"), want: []uint16{4, 0}},
		{mainCode: Code("0123"), testCode: Code("4567"), want: []uint16{0, 0}},
		{mainCode: Code("1038"), testCode: Code("9120"), want: []uint16{0, 2}},
	}

	for _, tc := range tests {
		move := Trial{
			MainCode: tc.mainCode,
			TestCode: tc.testCode,
		}
		dead, injured := move.Results()
		got := []uint16{dead, injured}
		if !reflect.DeepEqual(tc.want, got) {
			t.Fatalf("expected: %v, got: %v", tc.want, got)
		}
	}
}
