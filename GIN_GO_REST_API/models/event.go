package models

import (
	"time"

	"example.com/rest-api/db"
)

type Event struct {
	ID          int64
	Name        string    `binding:"required"`
	Description string    `binding:"required"`
	Location    string    `binding:"required"`
	DateTime    time.Time `binding:"required"`
	UserId      int64
}

func (ev *Event) Save() error {
	query := `INSERT INTO events(name,description,location,dateTime,user_id) VALUES(?,?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}

	defer stmt.Close()

	result, err := stmt.Exec(ev.Name, ev.Description, ev.Location, ev.DateTime, ev.UserId)
	if err != nil {
		return err
	}

	_, resultErr := result.LastInsertId()
	return resultErr
}

func (ev Event) Update() error {
	query := `
		UPDATE events SET name=?, description=?, location=?, dateTime= ?
		WHERE id =?
	`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}

	defer stmt.Close()

	_, err = stmt.Exec(ev.Name, ev.Description, ev.Location, ev.DateTime, ev.ID)
	return err
}

func (ev Event) Delete() error {
	query := `DELETE FROM events WHERE id =?`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}

	defer stmt.Close()

	_, err = stmt.Exec(ev.ID)
	return err
}

func GetAllEvents() ([]Event, error) {
	events := make([]Event, 0)

	query := "SELECT * FROM events"
	rows, err := db.DB.Query(query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.Name, &event.Description, &event.Location, &event.DateTime, &event.UserId)

		if err != nil {
			return nil, err
		}

		events = append(events, event)
	}

	return events, nil
}

func GetEventByID(id int64) (*Event, error) {
	var event Event
	query := "SELECT * FROM events WHERE id =?"
	row := db.DB.QueryRow(query, id)
	err := row.Scan(&event.ID, &event.Name, &event.Description, &event.Location, &event.DateTime, &event.UserId)
	if err != nil {
		return nil, err
	}
	return &event, nil
}

//Query - query for database, return multiple row
//QueryRow - query for database, return single row
//Exec - mutations for database
//Prepare - efficent as we store and preapre and exeucte the query
