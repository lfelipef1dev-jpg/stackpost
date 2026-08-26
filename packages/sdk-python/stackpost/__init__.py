"""StackPost SDK - Python
Uma integracao, 15 plataformas, 114 endpoints.
"""
import json
import urllib.request
import urllib.parse
from typing import Optional, List, Dict, Any

DEFAULT_BASE_URL = "https://stackpost.expostacker.com.br"


class StackPost:
    def __init__(self, api_key: str, base_url: str = DEFAULT_BASE_URL):
        self.api_key = api_key
        self.base_url = base_url

    def _request(self, method: str, path: str, body: Optional[Dict] = None) -> Any:
        url = f"{self.base_url}{path}"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
        }
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as res:
                return json.loads(res.read().decode())
        except urllib.error.HTTPError as e:
            err = json.loads(e.read().decode())
            raise Exception(err.get("error", f"HTTP {e.code}"))

    # Posts
    def create_post(self, platforms: List[str], text: str, upload_ids: Optional[List[str]] = None,
                    scheduled_at: Optional[str] = None, first_comment: Optional[str] = None) -> Dict:
        return self._request("POST", "/api/posts", {
            "platforms": platforms, "text": text, "uploadIds": upload_ids,
            "scheduledAt": scheduled_at, "firstComment": first_comment,
        })

    def list_posts(self, cursor: Optional[str] = None, limit: int = 20) -> Dict:
        q = f"?cursor={cursor}&limit={limit}" if cursor else f"?limit={limit}"
        return self._request("GET", f"/api/posts{q}")

    def publish_post(self, post_id: str) -> Dict:
        return self._request("POST", "/api/posts/publish", {"postId": post_id})

    def bulk_post(self, posts: List[Dict]) -> Dict:
        return self._request("POST", "/api/posts/bulk", {"posts": posts})

    # Social Accounts
    def list_accounts(self) -> List[Dict]:
        return self._request("GET", "/api/accounts")

    # Uploads
    def upload_from_url(self, url: str, file_name: Optional[str] = None) -> Dict:
        return self._request("POST", "/api/upload/from-url", {"url": url, "fileName": file_name})

    def init_upload(self, file_name: str, mime_type: str, size: int) -> Dict:
        return self._request("POST", "/api/upload/init", {"fileName": file_name, "mimeType": mime_type, "size": size})

    # Analytics
    def get_analytics(self, post_id: Optional[str] = None, platform: Optional[str] = None) -> Dict:
        q = f"?postId={post_id}" if post_id else f"?platform={platform}" if platform else ""
        return self._request("GET", f"/api/analytics{q}")

    # Comments
    def list_comments(self, post_id: str) -> List[Dict]:
        return self._request("GET", f"/api/comments?postId={post_id}")

    def post_comment(self, post_id: str, text: str, platform: str) -> Dict:
        return self._request("POST", "/api/comments", {"postId": post_id, "text": text, "platform": platform})

    # Webhooks
    def list_webhooks(self) -> List[Dict]:
        return self._request("GET", "/api/webhooks")

    def create_webhook(self, url: str, events: List[str]) -> Dict:
        return self._request("POST", "/api/webhooks", {"url": url, "events": events})

    def replay_webhook(self, event_id: str) -> Dict:
        return self._request("POST", "/api/webhooks/replay", {"eventId": event_id})

    # AI
    def generate_caption(self, platform: str, topic: str) -> Dict:
        return self._request("POST", "/api/ai/caption", {"platform": platform, "topic": topic})

    def suggest_hashtags(self, platform: str, content: str) -> Dict:
        return self._request("POST", "/api/ai/hashtags", {"platform": platform, "content": content})

    # Best time
    def get_best_time(self, platform: str) -> Dict:
        return self._request("GET", f"/api/best-time?platform={platform}")

    # Usage
    def get_daily_limits(self) -> Dict:
        return self._request("GET", "/api/usage/daily-limits")

    def get_monthly_usage(self) -> Dict:
        return self._request("GET", "/api/usage/monthly")
