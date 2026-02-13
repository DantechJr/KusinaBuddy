from click import prompt
from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import google.generativeai as genai
from pathlib import Path

# Force English responses globally
SYSTEM_RULES = """
You are a professional cooking assistant.

STRICT LANGUAGE RULES:
- Always respond in English only.
- Never use Filipino or Tagalog.
- Even if ingredients are written in another language, translate internally but output English.
- Use clean formatting.
"""

# ---------------------------------------------
# Load environment variables (local dev only)
dotenv_path = Path('.') / '.env'
if dotenv_path.exists():
    from dotenv import load_dotenv
    load_dotenv(dotenv_path)
# ---------------------------------------------

app = Flask(__name__, static_folder="static", template_folder="templates")

# --- Gemini setup ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("⚠️ GEMINI_API_KEY not found — AI features will be disabled")
    gemini_model = None
else:
    genai.configure(api_key=GEMINI_API_KEY)

    # Preferred models
    PREFERRED_MODELS = [
        "models/gemini-1.5-flash-latest",
        "models/gemini-1.5-pro",
        "models/gemini-1.0-pro",
    ]

    def pick_model():
        for name in PREFERRED_MODELS:
            try:
                m = genai.GenerativeModel(name)
                _ = m.generate_content("ping")
                return m
            except Exception:
                continue
        try:
            available = list(genai.list_models())
            supported = [
                m for m in available
                if "generateContent" in getattr(m, "supported_generation_methods", [])
            ]
            for m in supported:
                try:
                    gm = genai.GenerativeModel(m.name)
                    _ = gm.generate_content("ping")
                    return gm
                except Exception:
                    continue
        except Exception as e:
            print("⚠️ Could not list models:", e)
        return None

    try:
        gemini_model = pick_model()
        if gemini_model:
            print("✅ Gemini model loaded successfully")
        else:
            print("⚠️ No suitable Gemini model found — AI features disabled")
    except Exception as e:
        print("❌ Gemini failed to initialize:", e)
        gemini_model = None

# Prefer modern, widely-available models; fall back dynamically
PREFERRED_MODELS = [
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-pro",
    "models/gemini-1.0-pro",
]

def pick_model():
    # Try preferred names first
    for name in PREFERRED_MODELS:
        try:
            m = genai.GenerativeModel(name)
            _ = m.generate_content("ping")
            return m
        except Exception:
            continue

    # If all preferred failed, list models and choose one that supports generateContent
    try:
        available = list(genai.list_models())
        supported = [m for m in available if "generateContent" in getattr(m, "supported_generation_methods", [])]
        for m in supported:
            try:
                gm = genai.GenerativeModel(m.name)
                _ = gm.generate_content("ping")
                return gm
            except Exception:
                continue
    except Exception as e:
        raise RuntimeError(f"Could not list models: {e}")

    raise RuntimeError("No available Gemini model supports generateContent for this API key.")

# gemini_model = pick_model()

try:
    gemini_model = pick_model()
    print("✅ Gemini model loaded successfully")
except Exception as e:
    print("❌ Gemini failed to initialize:", e)
    gemini_model = None




@app.route("/")
def index():
    return render_template("index.html")

@app.route("/welcome")
def welcome():
    return render_template("welcome.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}
    query = data.get("query", "").strip()

    if not query:
        return jsonify({"result": "⚠️ Please enter an ingredient or dish name."})

    # ✅ Check if AI model is available
    if not gemini_model:
        return jsonify({"result": "❌ AI model is not available. Check your API key or model configuration."})

    try:
        prompt = f"""
Create a clear, step-by-step recipe using: {query}.

Include:
- Title
- Ingredients with quantities and price per ingredient
- Instructions (numbered)
- Estimated cooking time
- Servings
- Total price per batch
- Calorie estimate

Do not add disclaimers.
"""
        response = gemini_model.generate_content(SYSTEM_RULES + prompt)

        recipe = getattr(response, "text", None)
        if not recipe:
            parts = []
            for cand in getattr(response, "candidates", []) or []:
                for p in getattr(getattr(cand, "content", None), "parts", []) or []:
                    if getattr(p, "text", None):
                        parts.append(p.text)
            recipe = "\n".join(parts).strip() if parts else None

        if not recipe:
            return jsonify({"result": "❌ Error generating recipe: Empty response from model."})

        return jsonify({"result": recipe})

    except Exception as e:
        return jsonify({"result": f"❌ Error generating recipe: {str(e)}"})
    
# Weekly plan (ingredient-based)
@app.route("/weekplan", methods=["POST"])
def weekplan():
    data = request.get_json(silent=True) or {}
    ingredients = data.get("ingredients", "").strip()

    if not ingredients:
        return jsonify({"plan": "⚠️ Please enter some ingredients for the weekly plan."})

    # ✅ Check if AI model is available
    if not gemini_model:
        return jsonify({"plan": "❌ AI model is not available. Check your API key or model configuration."})

    try:
        prompt = f"""
Create a 7-day weekly meal plan using these ingredients: {ingredients}.

Include breakfast, lunch, and dinner for each day.
Provide title, ingredients with quantities and price, and short instructions.
"""
        response = gemini_model.generate_content(SYSTEM_RULES + prompt)

        plan = getattr(response, "text", None)
        if not plan:
            parts = []
            for cand in getattr(response, "candidates", []) or []:
                for p in getattr(getattr(cand, "content", None), "parts", []) or []:
                    if getattr(p, "text", None):
                        parts.append(p.text)
            plan = "\n".join(parts).strip() if parts else None

        if not plan:
            return jsonify({"plan": "❌ Error generating weekly plan: Empty response from model."})

        return jsonify({"plan": plan})

    except Exception as e:
        return jsonify({"plan": f"❌ Error generating weekly plan: {str(e)}"})

@app.route("/health")
def health():
    try:
        _ = gemini_model.generate_content("ping")
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500
    

if __name__ == "__main__":
    app.run(debug=True)
