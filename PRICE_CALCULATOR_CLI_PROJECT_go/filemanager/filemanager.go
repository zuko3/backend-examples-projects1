package filemanager

import (
	"bufio"
	"encoding/json"
	"errors"
	"os"
)

type FileManager struct {
	inputname  string
	outputname string
}

func (fm FileManager) ReadFile() ([]string, error) {
	//err variable for function scope
	if file, err := os.Open(fm.inputname); err != nil {
		return nil, errors.New("Error Opening File")
	} else {
		scanner := bufio.NewScanner(file)
		lines := make([]string, 0)

		for scanner.Scan() {
			lines = append(lines, scanner.Text())
		}

		// This creates a new variable err inside the if block
		// It shadows the outer err
		// Holds error from scanner.Err()
		// Create a new err variable just for this if block
		if err := scanner.Err(); err != nil {
			file.Close()
			return nil, errors.New("Error reading file content")
		}
		file.Close()
		return lines, nil
	}
}

func (fm FileManager) WriteFile(data interface{}) error {
	file, err := os.Create(fm.outputname)

	if err != nil {
		return errors.New("Failed to create file")
	}

	encoder := json.NewEncoder(file)
	err = encoder.Encode(data)

	if err != nil {
		file.Close()
		return errors.New("Failed to convert data to JSON")
	}

	file.Close()
	return nil
}

func New(inputname, outputname string) FileManager {
	return FileManager{
		inputname:  inputname,
		outputname: outputname,
	}
}
