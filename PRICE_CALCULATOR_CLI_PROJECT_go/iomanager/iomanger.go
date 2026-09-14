package iomanager

type IOManager interface {
	ReadFile() ([]string, error)
	WriteFile(data interface{}) error
}
