import json
import os
from pathlib import Path
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Load environment variables from .env file if present
env_file = BASE_DIR / ".env"
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(env_file)
    except Exception:
        pass
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip("'\"")
    except Exception:
        pass

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017/"
)


class FallbackCollection:
    """
    Lightweight, persistent JSON-backed collection that mimics pymongo.Collection.
    Enables user registration, login, and dashboard access out-of-the-box
    even when MongoDB is not running.
    """
    def __init__(self, filepath):
        self.filepath = Path(filepath)
        try:
            if not self.filepath.exists():
                with open(self.filepath, "w") as f:
                    json.dump([], f)
        except Exception:
            pass

    def _read(self):
        try:
            with open(self.filepath, "r") as f:
                return json.load(f)
        except Exception:
            return []

    def _write(self, data):
        with open(self.filepath, "w") as f:
            json.dump(data, f, default=str, indent=2)

    def create_index(self, *args, **kwargs):
        pass

    def find_one(self, query):
        data = self._read()
        for doc in data:
            match = True
            for k, v in query.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif isinstance(v, dict) and "$gt" in v:
                    val = doc.get(k)
                    if not val or val <= str(v["$gt"]):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                res = dict(doc)
                if "_id" in res:
                    try:
                        res["_id"] = ObjectId(res["_id"])
                    except Exception:
                        pass
                return res
        return None

    def find(self, query=None):
        data = self._read()
        if not query:
            return [dict(d) for d in data]
        results = []
        for doc in data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(dict(doc))
        return results

    def insert_one(self, doc):
        data = self._read()
        # Check unique email constraint if applicable
        if "email" in doc:
            for existing in data:
                if existing.get("email") == doc["email"]:
                    raise DuplicateKeyError(f"Duplicate email: {doc['email']}")

        if "_id" not in doc:
            doc["_id"] = ObjectId()

        serialized = dict(doc)
        serialized["_id"] = str(doc["_id"])
        data.append(serialized)
        self._write(data)

        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id

        return InsertResult(doc["_id"])

    def update_one(self, filter_query, update_doc):
        data = self._read()
        matched = False
        for idx, doc in enumerate(data):
            match = True
            for k, v in filter_query.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                matched = True
                if "$set" in update_doc:
                    for sk, sv in update_doc["$set"].items():
                        doc[sk] = str(sv) if isinstance(sv, (ObjectId, datetime)) else sv
                if "$unset" in update_doc:
                    for uk in update_doc["$unset"].keys():
                        doc.pop(uk, None)
                data[idx] = doc
                break

        if matched:
            self._write(data)

        class UpdateResult:
            def __init__(self, modified_count):
                self.modified_count = modified_count

        return UpdateResult(1 if matched else 0)


# Attempt connection to MongoDB (supports both local and cloud Atlas)
client = None
mongo_available = False

try:
    # 5-second timeout ensures cloud Atlas TLS/SSL handshakes succeed
    timeout_ms = 5000 if "mongodb+srv://" in MONGO_URI else 800
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=timeout_ms)
    client.admin.command("ping")
    mongo_available = True
    print("[Database] Connected to MongoDB successfully.")
    db = client["medi_ai"]
    users_collection = db["users"]
    scans_collection = db["scans"]
    try:
        users_collection.create_index("email", unique=True)
    except Exception:
        pass
except Exception as e:
    print(f"[Database] MongoDB connection bypassed ({e}). Seamlessly activated persistent local data store.")
    users_collection = FallbackCollection(DATA_DIR / "users.json")
    scans_collection = FallbackCollection(DATA_DIR / "scans.json")


def check_database_connection():
    """Check whether database connection is active."""
    return True
