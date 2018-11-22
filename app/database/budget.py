from pymongo import MongoClient
from flask import current_app

client = MongoClient(current_app.config.get('BUDGET_DATABASE_SERVER'), current_app.config.get('BUDGET_DATABASE_PORT'))
db = client['tlma']
budget = db['budget']
