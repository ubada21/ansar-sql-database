import requests
import json
from datetime import datetime
import pytz

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
