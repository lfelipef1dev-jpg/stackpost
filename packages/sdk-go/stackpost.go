// StackPost SDK - Go
// Uma integracao, 15 plataformas, 114 endpoints.
package stackpost

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

const DefaultBaseURL = "https://stackpost.expostacker.com.br"

type Client struct {
	APIKey  string
	BaseURL string
}

func New(apiKey string) *Client {
	return &Client{APIKey: apiKey, BaseURL: DefaultBaseURL}
}

func (c *Client) request(method, path string, body interface{}) (map[string]interface{}, error) {
	var reqBody io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		reqBody = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, c.BaseURL+path, reqBody)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.APIKey)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var data map[string]interface{}
	json.NewDecoder(res.Body).Decode(&data)

	if res.StatusCode >= 400 {
		return nil, fmt.Errorf("HTTP %d: %v", res.StatusCode, data["error"])
	}

	return data, nil
}

type PostParams struct {
	Platforms    []string `json:"platforms"`
	Text         string   `json:"text"`
	UploadIds    []string `json:"uploadIds,omitempty"`
	ScheduledAt  string   `json:"scheduledAt,omitempty"`
	FirstComment string   `json:"firstComment,omitempty"`
}

func (c *Client) CreatePost(params PostParams) (map[string]interface{}, error) {
	return c.request("POST", "/api/posts", params)
}

func (c *Client) ListPosts(cursor string, limit int) (map[string]interface{}, error) {
	q := url.Values{}
	if cursor != "" {
		q.Set("cursor", cursor)
	}
	q.Set("limit", fmt.Sprintf("%d", limit))
	return c.request("GET", "/api/posts?"+q.Encode(), nil)
}

func (c *Client) PublishPost(postId string) (map[string]interface{}, error) {
	return c.request("POST", "/api/posts/publish", map[string]string{"postId": postId})
}

func (c *Client) ListAccounts() (map[string]interface{}, error) {
	return c.request("GET", "/api/accounts", nil)
}

func (c *Client) UploadFromURL(uploadURL string) (map[string]interface{}, error) {
	return c.request("POST", "/api/upload/from-url", map[string]string{"url": uploadURL})
}

func (c *Client) GetAnalytics(postId string) (map[string]interface{}, error) {
	return c.request("GET", "/api/analytics?postId="+postId, nil)
}

func (c *Client) GenerateCaption(platform, topic string) (map[string]interface{}, error) {
	return c.request("POST", "/api/ai/caption", map[string]string{"platform": platform, "topic": topic})
}
