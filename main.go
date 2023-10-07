package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
)

func PrettyString(str string) {
	var prettyJSON bytes.Buffer
	if err := json.Indent(&prettyJSON, []byte(str), "", "    "); err != nil {
		return
	}
	res := prettyJSON.String()
	fmt.Print(res)
}
func main() {
	baseURL := "https://api.mangadex.org"
	//store first argument as title
	title := os.Args[1]
	if title == "" {
		fmt.Println("No title given")
		return
	}

	// Build the URL with the query parameters
	u, err := url.Parse(fmt.Sprintf("%s/manga", baseURL))
	if err != nil {
		fmt.Println("Error parsing URL:", err)
		return
	}
	q := u.Query()
	q.Set("title", title)
	u.RawQuery = q.Encode()

	// Make the HTTP GET request
	fmt.Println("Making request to", u.String())
	resp, err := http.Get(u.String())
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()

	// Parse the JSON response
	var mangaDexRes struct {
		Result string `json:"result"`
		Data   []struct {
			ID         string `json:"id"`
			Attributes struct {
				Titles map[string]string `json:"title"`
				Status string            `json:"status"`
				Year   int               `json:"year"`
			} `json:"attributes"`
		} `json:"data"`
	}

	err = json.NewDecoder(resp.Body).Decode(&mangaDexRes)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return
	}

	res, err := json.Marshal(mangaDexRes)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}
	PrettyString(string(res))
}
