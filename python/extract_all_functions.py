from pymongo import MongoClient
import json
import sys

try:
    client = MongoClient(host= ['localhost:27017'], serverSelectionTimeoutMS = 2000)
    client.server_info()
    db = client.typescript
except:
    print('mongo isn\'t currently running...please start it first')
    sys.exit()

def output_json_for_project(handle):
    results = handle.find({}, {'_id': False})

    for result in results:
        with open('typescript-function-results.json', 'a') as output_file:
            output_file.write(json.dumps(result))
            output_file.write('\n')


output_json_for_project(db.functions)
