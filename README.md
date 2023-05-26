# One dead

One dead is a strategic guessing game. It's about guessing a four correctly a four
digit number made by computer with least amount of tries.

## Key terms

* Code: A four digit number with no repeating digits.
* Main code: A code generated by your opponent or computer that you're trying to
  guess.
* Test code: A code that is sent to your opponent as a trial to guess their main
  code.
* Dead: The number of digits from the guessed code that exists in the main code
  and were at their correct position.
* Injured: The number of digits from the guessed code that exists in the main code
  but are not at their correct position.

## How it's played

The game started when computer generates and stores a 4 digit random code. This number
will have no repeating digits. Then the player will try to guess that as trials.
For each try a player makes, they a given two clues: Dead count and Injured count.
The player wins when they get a "four dead" count.

The goal of the player is to minimize the amount of trials to make to achieve
"four dead".

## Credits

I learnt about this game during my secondary school days at *feedy*
