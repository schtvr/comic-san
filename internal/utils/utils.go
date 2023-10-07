package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
)

func PrettyString(str string) {
	var prettyJSON bytes.Buffer
	if err := json.Indent(&prettyJSON, []byte(str), "", "    "); err != nil {
		return
	}
	res := prettyJSON.String()
	fmt.Print(res)
}
