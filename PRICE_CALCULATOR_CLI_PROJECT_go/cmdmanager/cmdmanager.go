package cmdmanager

import "fmt"

type CmdManager struct {
	inputname  string
	outputname string
}

func (cmd CmdManager) ReadFile() ([]string, error) {
	stringList := make([]string, 0)
	fmt.Println("Cmd readfile executed...")
	return stringList, nil
}

func (cmd CmdManager) WriteFile(data interface{}) error {
	fmt.Println("Cmd writefile executed...")
	return nil
}

func New(inputname, outputname string) CmdManager {
	return CmdManager{
		inputname:  inputname,
		outputname: outputname,
	}
}
