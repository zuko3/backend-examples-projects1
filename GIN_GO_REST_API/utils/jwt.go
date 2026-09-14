package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const secretKEY = "supersecret"

func GenerateToken(email string, userId int64) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":  email,
		"userId": userId,
		"exp":    time.Now().Add(time.Hour * 2).Unix(), //token valid for 2 hours
	})
	return token.SignedString([]byte(secretKEY))
}

func VerifyToken(token string) (int64, error) {
	parsedToken, err := jwt.Parse(token, func(inputToken *jwt.Token) (interface{}, error) {
		_, ok := inputToken.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secretKEY), nil
	})

	if err != nil {
		return 0, errors.New("Could not parse Token")
	}
	isValid := parsedToken.Valid

	if !isValid {
		return 0, errors.New("Invalid Token")
	}

	//get value from claims
	claims, ok := parsedToken.Claims.(jwt.MapClaims)

	if !ok {
		return 0, errors.New("Invalid Token Claim")
	}

	userId := int64(claims["userId"].(float64))

	return userId, nil

}
