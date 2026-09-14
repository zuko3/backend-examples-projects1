package models

import (
	"errors"

	"example.com/rest-api/db"
	"example.com/rest-api/utils"
)

type User struct {
	ID       int64
	Email    string `binding:"required"`
	Password string `binding:"required"`
}

func (user User) Save() error {
	query := `INSERT INTO users(email, password) VALUES(?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}

	defer stmt.Close()
	hashPassord, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	result, err := stmt.Exec(user.Email, hashPassord)
	if err != nil {
		return err
	}

	_, resultErr := result.LastInsertId()
	return resultErr
}

func (user *User) ValidateCredentials() error {
	query := "SELECT id ,password FROM users where email=?"
	row := db.DB.QueryRow(query, user.Email)
	var retrivedPassword string
	err := row.Scan(&user.ID, &retrivedPassword)

	if err != nil {
		return err
	}
	isValidPWD := utils.CheckPasswordHash(retrivedPassword, user.Password)
	if !isValidPWD {
		return errors.New("Credential Invalid")
	}
	return nil
}
