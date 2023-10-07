package mangadex

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	config "github.com/schtvr/comic-san/pkg/config"
)

type MangaDex struct {
	country string
	options *config.Options
}

func NewMangadex(options *config.Options) *MangaDex {
	return &MangaDex{
		country: strings.ToLower(options.Country),
		options: options,
	}
}
func (m *MangaDex) searchManga(title string) {
	baseURL := "https://api.mangadex.org"
	// endpoint := "/manga"
	// res, err := http.Get(baseURL + endpoint)

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

	res, err := json.MarshalIndent(mangaDexRes, "", "  ")
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}
	fmt.Println(string(res))
	return
}

func (m *MangaDex) GetInfo(mangaID string) {
	m.searchManga("black clover")
}
