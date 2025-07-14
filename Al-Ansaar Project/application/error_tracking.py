import requests
import json
from datetime import datetime
import pytz


class ErrorTracking:
    def __init__(self):
        self.webhook_url = "https://ponteminnovationsca834.webhook.office.com/webhookb2/3576adbf-bcdb-475b-950e-87ec9d023a38@601cf4c1-bb5f-40c6-8816-aef4242fe2a0/IncomingWebhook/5c5fca81bb3549e8a6c09374ab4fbe85/b1cc0f08-0ca8-4e8f-b940-8c0b167fb558"

    def track_error(self, error_message, user_email, url):
        data = {
            "@context": "https://schema.org/extensions",
            "@type": "MessageCard",
            "@themeColor": "0072C6",
            "title": datetime.now(pytz.timezone("Canada/Mountain")).strftime(
                "%A %B %d %Y %H:%M:%S"
            )
            + " - McNish Error",
            "msteams": {
                "entities": [
                    {
                        "type": "mention",
                        "text": "<at>Geoff</at>",
                        "mentioned": {
                            "id": "ghawes@solut.ca",
                            "name": "Geoffrey Hawes",
                        },
                    }
                ]
            },
        }
        data[
            "text"
        ] = f"User Email: {user_email} \n\n \n\n {error_message} \n\n \n\n {url}"
        json_data = json.dumps(data)

        response = requests.post(
            self.webhook_url,
            data=json_data,
            headers={"Content-Type": "application/json"},
        )
