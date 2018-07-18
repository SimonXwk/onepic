from flask_dance.consumer.backend import BaseBackend
import os
import json
from flask import current_app


class FileBackend(BaseBackend):
    def __init__(self, file_name):
        super(FileBackend, self).__init__()
        self.file_path = os.path.join(current_app.instance_path, file_name)
        print(self.file_path)

    def get(self, blueprint):
        if not os.path.exists(self.file_path):
            return None
        with open(self.file_path) as f:
            return json.load(f)

    def set(self, blueprint, token):
        with open(self.file_path, "w") as f:
            json.dump(token, f)

    def delete(self, blueprint):
        os.remove(self.file_path)


file_backend = FileBackend('oauth.json')
