package models

import (
	"database/sql/driver"
	"fmt"
	"strings"
)

// StringArray is a custom type for PostgreSQL text[] arrays
type StringArray []string

// Scan implements the sql.Scanner interface for reading from database
func (a *StringArray) Scan(src interface{}) error {
	if src == nil {
		*a = StringArray{}
		return nil
	}

	switch v := src.(type) {
	case []byte:
		return a.parsePostgresArray(string(v))
	case string:
		return a.parsePostgresArray(v)
	default:
		return fmt.Errorf("unsupported type for StringArray: %T", src)
	}
}

// Value implements the driver.Valuer interface for writing to database
func (a StringArray) Value() (driver.Value, error) {
	if a == nil || len(a) == 0 {
		return nil, nil
	}

	elements := make([]string, len(a))
	for i, s := range a {
		escaped := strings.ReplaceAll(s, `\`, `\\`)
		escaped = strings.ReplaceAll(escaped, `"`, `\"`)
		elements[i] = fmt.Sprintf(`"%s"`, escaped)
	}
	return fmt.Sprintf("{%s}", strings.Join(elements, ",")), nil
}

func (a *StringArray) parsePostgresArray(s string) error {
	s = strings.TrimSpace(s)
	if s == "{}" || s == "" {
		*a = StringArray{}
		return nil
	}

	s = strings.TrimPrefix(s, "{")
	s = strings.TrimSuffix(s, "}")

	var result []string
	var current strings.Builder
	inQuotes := false
	escaped := false

	for _, c := range s {
		if escaped {
			current.WriteRune(c)
			escaped = false
			continue
		}
		switch {
		case c == '\\':
			escaped = true
		case c == '"':
			inQuotes = !inQuotes
		case c == ',' && !inQuotes:
			result = append(result, current.String())
			current.Reset()
		default:
			current.WriteRune(c)
		}
	}

	if current.Len() > 0 {
		result = append(result, current.String())
	}

	*a = result
	return nil
}
