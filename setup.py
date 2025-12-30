
import json, os

def setup_config():
    print("=== Create coder.config.json for Coder ===")

    provider_name = input("Enter provider name (e.g. lmstudio, ollama, etc.): ").strip()

    print("\nEnter model names (one per line).")
    print("Press ENTER on an empty line to finish:")
    models = []
    while True:
        model = input("> ").strip()
        if not model:
            break
        models.append(model)

    if not models:
        print("Error: at least one model is required.")
        return

    base_url = input("\nEnter baseUrl (i.e., http://localhost:1234/v1): ").strip()

    config = {
        "coder": {
            "providers": [
                {
                    "name": provider_name,
                    "models": models,
                    "baseUrl": base_url
                }
            ]
        }
    }

    output_file = "coder.config.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

    print(f"\n✔ coder.config.json created at: {os.path.abspath(output_file)}")

setup_config()
