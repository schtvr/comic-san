// Initialize loads links and metadata from mangadex
package core

// Comic struct contains all the informations about a comic
type Comic struct {
	Author       string
	Name         string
	IssueNumber  string
	Source       string
	URLSource    string
	Links        []string
	Format       string
	ImagesFormat string
}
