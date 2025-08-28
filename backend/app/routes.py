from flask import current_app, jsonify, request
from bson import ObjectId
from datetime import datetime

# A helper to convert ObjectId to string for JSON serialization
def mongo_to_json(data):
    """
    Recursively converts MongoDB documents to JSON-serializable formats.
    Converts ObjectId to string and datetime to ISO format string.
    """
    if isinstance(data, list):
        return [mongo_to_json(item) for item in data]
    if isinstance(data, dict):
        return {key: mongo_to_json(value) for key, value in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    if isinstance(data, datetime):
        return data.isoformat()
    return data


@current_app.route('/api/notes', methods=['POST'])
def create_note():
    db = current_app.extensions['pymongo_db']
    data = request.get_json()
    
    note = {
        "title": data.get("title", "Untitled Note"),
        "body": data.get("body", ""),
        "category": data.get("category", "Fleeting"),
        "isPermanent": False,
        "status": "staged", # All new notes are staged
        "source": data.get("source", None),
        "links": [],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = db.notes.insert_one(note)
    note['_id'] = str(result.inserted_id)
    return jsonify(mongo_to_json(note)), 201

@current_app.route('/api/notes', methods=['GET'])
def get_notes():
    print("Attempting to get notes")
    db = current_app.extensions['pymongo_db']
    status = request.args.get('status', 'committed')
    query_param = request.args.get('q', None)

    filter_query = {"status": status}
    if query_param:
        filter_query["$or"] = [
            {"title": {"$regex": query_param, "$options": "i"}},
            {"body": {"$regex": query_param, "$options": "i"}}
        ]
        
    notes = list(db.notes.find(filter_query).sort("updatedAt", -1))
    return jsonify(mongo_to_json(notes)), 200

@current_app.route('/api/notes/<note_id>', methods=['GET'])
def get_note(note_id):
    db = current_app.extensions['pymongo_db']
    try:
        oid = ObjectId(note_id)
    except:
        return jsonify({"error": "Invalid note ID format"}), 400

    note = db.notes.find_one({"_id": oid})
    if not note:
        return jsonify({"error": "Note not found"}), 404
        
    # Option A: Compute backlinks on-demand
    backlinks_cursor = db.notes.find({"links.targetNoteId": oid})
    backlinks = []
    for linking_note in backlinks_cursor:
        for link in linking_note['links']:
            if link['targetNoteId'] == oid:
                backlinks.append({
                    "sourceNoteId": str(linking_note['_id']),
                    "sourceNoteTitle": linking_note['title'],
                    "relationshipTypeId": str(link['relationshipTypeId'])
                })
    note['backlinks'] = backlinks
    
    return jsonify(mongo_to_json(note)), 200

@current_app.route('/api/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    db = current_app.extensions['pymongo_db']
    try:
        oid = ObjectId(note_id)
    except:
        return jsonify({"error": "Invalid note ID format"}), 400
    
    data = request.get_json()
    update_fields = {
        "updatedAt": datetime.utcnow()
    }
    
    # Allow updating specific fields
    allowed_fields = ["title", "body", "category", "isPermanent", "source", "links"]
    for field in allowed_fields:
        if field in data:
            update_fields[field] = data[field]
            
    result = db.notes.update_one({"_id": oid}, {"$set": update_fields})
    
    if result.matched_count == 0:
        return jsonify({"error": "Note not found"}), 404
        
    return jsonify({"message": "Note updated successfully"}), 200

@current_app.route('/api/notes/<note_id>/commit', methods=['POST'])
def commit_note(note_id):
    db = current_app.extensions['pymongo_db']
    try:
        oid = ObjectId(note_id)
    except:
        return jsonify({"error": "Invalid note ID format"}), 400
        
    data = request.get_json()
    final_links = data.get('links', [])
    
    # Validate and format links
    for link in final_links:
        link['targetNoteId'] = ObjectId(link['targetNoteId'])
        link['relationshipTypeId'] = ObjectId(link['relationshipTypeId'])
        
    # Update note to committed and set final links
    result = db.notes.update_one(
        {"_id": oid},
        {"$set": {
            "status": "committed",
            "links": final_links,
            "updatedAt": datetime.utcnow()
        }}
    )
    
    if result.matched_count == 0:
        return jsonify({"error": "Note not found to commit"}), 404

    # Per spec, delete all suggestions for this note upon commit
    db.suggestions.delete_many({"sourceNoteId": oid})
    
    return jsonify({"message": "Note committed successfully"}), 200


@current_app.route('/api/relationship_types', methods=['GET'])
def get_relationship_types():
    db = current_app.extensions['pymongo_db']
    types = list(db.relationshipTypes.find({}))
    return jsonify(mongo_to_json(types)), 200


# SUGGESTIONS ARE HANDLED EPHEMERALLY ON THE FRONTEND FOR THE MVP
# AND PASSED IN THE COMMIT PAYLOAD.
# NO BACKEND SUGGESTION MANAGEMENT IS NEEDED FOR THIS MVP VERSION
# PER THE FINAL SPECIFICATION.