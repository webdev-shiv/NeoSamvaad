"""
Utility script to apply schema.cypher or seed.cypher against the configured Neo4j instance.

Usage:
    python scripts/run_cypher.py schema
    python scripts/run_cypher.py seed
"""

import argparse
import sys
from pathlib import Path

# Add project root and backend to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(backend_dir))

try:
    from backend.app.config import get_settings
    from backend.app.neo4j_client import get_neo4j_client
except ImportError:
    from app.config import get_settings
    from app.neo4j_client import get_neo4j_client


def run_script(script_name: str):
    settings = get_settings()
    if not settings.is_neo4j_configured:
        print("[ERROR] Neo4j connection details are not configured in .env or environment.")
        print("Please configure NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD in your .env file.")
        sys.exit(1)

    script_path = Path(__file__).resolve().parent / f"{script_name}.cypher"
    if not script_path.exists():
        print(f"[ERROR] Cypher script not found at {script_path}")
        sys.exit(1)

    print(f"[INFO] Connecting to Neo4j at {settings.neo4j_uri}...")
    client = get_neo4j_client()
    if not client.verify_connectivity():
        print("[ERROR] Could not connect to Neo4j. Please verify URI and credentials.")
        sys.exit(1)

    print(f"[INFO] Executing {script_path.name}...")
    with open(script_path, "r", encoding="utf-8") as f:
        cypher_content = f.read()

    results = client.apply_cypher_script(cypher_content)
    print(f"[SUCCESS] Executed {len(results)} statement(s) successfully.")


def main():
    parser = argparse.ArgumentParser(
        description="Execute Cypher scripts against the configured Neo4j AuraDB instance.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  schema   Apply uniqueness constraints and indexes (schema.cypher)
  seed     Load synthetic customer support demo records (seed.cypher)

Examples:
  python scripts/run_cypher.py schema
  python scripts/run_cypher.py seed
        """,
    )
    parser.add_argument(
        "action",
        choices=["schema", "seed"],
        help="The Cypher script to run: 'schema' for constraints or 'seed' for demo data.",
    )

    args = parser.parse_args()
    run_script(args.action)


if __name__ == "__main__":
    main()
