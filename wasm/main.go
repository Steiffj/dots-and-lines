package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fmt.Println("Hello, WebAssembly!")
	text, err := os.ReadFile("/work/draft.txt")
	if err != nil {
		log.Fatalf("could not read file. Error: %v", err)
	} else {
		fmt.Println(string(text))
	}
}
