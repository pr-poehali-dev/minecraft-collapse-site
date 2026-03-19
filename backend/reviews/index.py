import json
import os
import psycopg2


SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Получение и добавление отзывов о Collaps Client."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**CORS, "Access-Control-Max-Age": "86400"}, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, nickname, rating, text, created_at FROM {SCHEMA}.reviews ORDER BY created_at DESC LIMIT 50"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        reviews = [
            {"id": r[0], "nickname": r[1], "rating": r[2], "text": r[3], "created_at": r[4].isoformat()}
            for r in rows
        ]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"reviews": reviews})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        nickname = (body.get("nickname") or "").strip()[:50]
        rating = int(body.get("rating") or 0)
        text = (body.get("text") or "").strip()[:1000]

        if not nickname or not text or rating < 1 or rating > 5:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполни все поля"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.reviews (nickname, rating, text) VALUES (%s, %s, %s) RETURNING id",
            (nickname, rating, text),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "id": new_id})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
