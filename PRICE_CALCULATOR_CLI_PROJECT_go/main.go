package main

import (
	"fmt"

	"example.com/price-calculator/cmdmanager"
	"example.com/price-calculator/filemanager"
	"example.com/price-calculator/prices"
)

func main() {
	fmt.Println("Intrest Calculator--->>>")
	taxRates := []float64{0, 0.07, 0.1, 0.15}

	for _, taxRate := range taxRates {
		fm := filemanager.New("prices.txt", fmt.Sprintf("result_%0.f.json", taxRate*100))
		cm := cmdmanager.New("", "")
		priceJob := prices.NewTaxIncludedPricesJob(fm, taxRate)
		(*priceJob).Process()

		priceJobTest := prices.NewTaxIncludedPricesJob(cm, taxRate)
		(*priceJobTest).Process()
	}
}
