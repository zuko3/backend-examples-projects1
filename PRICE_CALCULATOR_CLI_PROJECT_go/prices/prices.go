package prices

import (
	"fmt"

	"example.com/price-calculator/conversion"
	"example.com/price-calculator/iomanager"
)

type TaxIncludedPricesJob struct {
	TaxRate           float64             `json:"tax_rate"`
	InputPrices       []float64           `json:"input_price"`
	TaxIncludedPrices map[string]string   `json:"tax_included_price"`
	IOManager         iomanager.IOManager `json:"-"`
}

func (job *TaxIncludedPricesJob) LoadData() {
	if lines, err := (*job).IOManager.ReadFile(); err != nil {
		fmt.Println("Error:", err)
	} else {
		if prices, err := conversion.StringToFloat(lines); err != nil {
			fmt.Println("Error:", err)
			return
		} else {
			(*job).InputPrices = prices
		}
	}
}

func (job *TaxIncludedPricesJob) Process() {
	(*job).LoadData()
	result := make(map[string]string)
	for _, price := range (*job).InputPrices {
		calcPrice := price * (1 + (*job).TaxRate)
		result[fmt.Sprintf("%0.2f", price)] = fmt.Sprintf("%0.2f", calcPrice)
	}
	(*job).TaxIncludedPrices = result

	if err := (*job).IOManager.WriteFile(job); err != nil {
		fmt.Println("Error:", err)
	}
}

func NewTaxIncludedPricesJob(cm iomanager.IOManager, taxRate float64) *TaxIncludedPricesJob {
	return &TaxIncludedPricesJob{
		TaxRate:   taxRate,
		IOManager: cm,
	}
}
