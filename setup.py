import json, os

def ask_yes_no(prompt: str) -> bool:
    while True:
        answer = input(prompt + " (y/n): ").strip().lower()
        if answer in ("y", "yes"):
            return True
        if answer in ("n", "no"):
            return False
        print("Please enter y or n.")

def setup_config():
    print("=== Create coder.config.json ===\n")

    providers = []

    while True:
        print("Add a provider:")

        name = input("  Provider name: ").strip()
        model = input("  Model: ").strip()
        base_url = input("  Base URL: ").strip()

        provider = {
            "name": name,
            "models": [model],
            "baseUrl": base_url
        }

        providers.append(provider)

        print()
        if not ask_yes_no("Add another provider?"):
            break
        print()

    config = {
        "coder": {
            "providers": providers
        }
    }

    output_file = "coder.config.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

    print(f"\n✔ coder.config.json created at:")
    print(f"  {os.path.abspath(output_file)}")

setup_config()
