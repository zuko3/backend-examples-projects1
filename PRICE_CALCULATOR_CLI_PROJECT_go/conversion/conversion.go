package conversion

import (
	"errors"
	"fmt"
	"strconv"
)

func StringToFloat(strings []string) ([]float64, error) {
	flist := make([]float64, 0)
	for _, stringVal := range strings {
		if val, err := strconv.ParseFloat(stringVal, 64); err != nil {
			fmt.Println("Error Converting Price To Float Failed", err)
			return nil, errors.New("Failed To Convert String To Float")
		} else {
			flist = append(flist, val)
		}
	}
	return flist, nil
}
