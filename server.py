import json  # Import json module
import uuid

import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS  # Only if needed for cross-origin requests

app = Flask(__name__, static_folder="public", template_folder="public")
CORS(app)  # Enable CORS if frontend is served separately

# LLM API configuration
BASE_URL_V2 = "https://agent.api.lyzr.app/v2"
API_KEY = "lyzr-xxx"  # Replace with your actual API key

headers = {
    "accept": "application/json",
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
}

AGENT_ID = "11111111"  # Replace with your actual agent ID

USER_ID = str(uuid.uuid4())
SESSION_ID = str(uuid.uuid4())


@app.route("/")
def home():
    return send_from_directory(app.template_folder, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)


@app.route("/chat", methods=["POST"])
def chat():
    global count
    user_message = request.json.get("message", "")
    current_piece = request.json.get("current_piece", [])
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Prepare payload for LLM API
    payload = {
        "user_id": USER_ID,
        "agent_id": AGENT_ID,
        "message": f"User Input: {user_message}\nCurrent Piece: {current_piece}",
        "session_id": SESSION_ID,
    }

    response = requests.post(f"{BASE_URL_V2}/chat/", headers=headers, json=payload)
    if response.status_code == 200:
        chat_response = response.json()
        agent_reply = chat_response.get("response", "")
        # Parse agent_reply to extract music notes
        music_notes = parse_llm_response(agent_reply)
        return jsonify({"music_notes": music_notes})
    else:
        return jsonify({"error": "Failed to get response from LLM"}), 500


def parse_llm_response(agent_reply):
    """
    Parse the LLM's response and convert it into a list of note events.
    """
    try:
        # Safely parse JSON
        music_notes = eval(agent_reply)
        print(music_notes)
        # Validate the note events
        for note_event in music_notes:
            time = note_event.get("time")
            duration = note_event.get("duration")
            notes = note_event.get("notes")
            if (
                not isinstance(time, int)
                or not isinstance(duration, int)
                or not isinstance(notes, list)
            ):
                raise ValueError("Invalid note event format")
            for note in notes:
                if not isinstance(note, int) or not (21 <= note <= 108):
                    raise ValueError(f"Invalid MIDI note number: {note}")
        return music_notes
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return []
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        return []


if __name__ == "__main__":
    app.run(debug=True)
