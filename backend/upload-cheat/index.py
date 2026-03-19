import json
import os
import base64
import boto3


def handler(event: dict, context) -> dict:
    """Загружает файл чита на S3 и возвращает публичную ссылку для скачивания."""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")
    file_name = body.get("fileName", "cheat.jar")
    file_data_b64 = body.get("fileData", "")
    content_type = body.get("contentType", "application/octet-stream")

    if not file_data_b64:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Файл не передан"}),
        }

    file_bytes = base64.b64decode(file_data_b64)

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

    key = f"cheats/{file_name}"
    s3.put_object(
        Bucket="files",
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
        ContentDisposition=f'attachment; filename="{file_name}"',
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"url": cdn_url, "fileName": file_name}),
    }
