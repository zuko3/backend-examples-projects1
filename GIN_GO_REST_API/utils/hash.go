package utils

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
	//convert string to bytes
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	//covert bytes to string
	return string(bytes), err
}

func CheckPasswordHash(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
