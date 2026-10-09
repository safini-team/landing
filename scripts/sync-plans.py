#!/usr/bin/env python3
"""Sync static pricing numbers across locales; import limits from API code.

Use --api-repo ../safini-api --api-ref origin/main after fetching that repo,
or omit --api-ref to read its working tree. Never imports or executes API code.
Prices are marketing USD references; localized checkout prices come from stores.
"""
import argparse
import ast
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--api-repo", type=Path)
parser.add_argument("--api-ref", help="Git ref to read instead of the API working tree")
parser.add_argument("--check", action="store_true", help="Fail on drift without writing")
args = parser.parse_args()
config_path = ROOT / "assets/plans.json"
original = json.loads(config_path.read_text())
config = dict(original)

if args.api_ref and not args.api_repo:
    parser.error("--api-ref requires --api-repo")
if args.api_repo:
    repo = args.api_repo.resolve()
    api_path = "app/services/free_limits.py"
    if args.api_ref:
        source = subprocess.check_output(
            ["git", "-C", str(repo), "show", f"{args.api_ref}:{api_path}"], text=True
        )
        commit = subprocess.check_output(
            ["git", "-C", str(repo), "rev-parse", args.api_ref], text=True
        ).strip()
    else:
        source = (repo / api_path).read_text()
        commit = "working-tree"
    constants = {}
    for node in ast.parse(source).body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id.startswith("FREE_"):
                    constants[target.id] = ast.literal_eval(node.value)
    for key, name in {
        "free_parents": "FREE_PARENTS",
        "free_children": "FREE_CHILDREN",
        "free_apps": "FREE_CONTROLLED_APPS",
        "free_tasks": "FREE_RECURRING_TASKS",
    }.items():
        value = constants[name]
        if type(value) is not int or value < 1:
            raise ValueError(f"Invalid API limit: {name}")
        config[key] = value
    config["limits_source"] = dict(config["limits_source"], commit=commit,
                                 ref=args.api_ref or "working-tree")

if config["currency"] != "USD" or not 0 < config["yearly"] < config["monthly"] * 12:
    raise ValueError("Expected USD prices with a positive annual saving")
values = {key: str(config[key]) for key in ("free_parents", "free_children", "free_apps", "free_tasks")}
values.update(monthly=f'${config["monthly"]:g}', yearly=f'${config["yearly"]:g}',
              savings=str(int((1 - config["yearly"] / (12 * config["monthly"])) * 100)))
pattern = re.compile(r'(<span data-plan="([a-z_]+)">)([^<]*)(</span>)')
drift = []
for locale in ("", "ru", "uz", "ky", "kk"):
    page = ROOT / locale / "index.html"
    html = page.read_text()
    keys = set()
    def replace(match):
        key = match[2]
        keys.add(key)
        return match[1] + values[key] + match[4]
    synced = pattern.sub(replace, html)
    if keys != set(values):
        raise ValueError(f"Missing plan fields in {page}: {set(values) - keys}")
    if synced != html:
        drift.append(str(page.relative_to(ROOT)))
        if not args.check:
            page.write_text(synced)
if any(config[key] != original[key] for key in values if key in config):
    drift.append("assets/plans.json (API limits)")
if args.check and drift:
    raise SystemExit("Plan drift: " + ", ".join(drift))
if not args.check:
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
print("Plan values verified across all 5 languages." if args.check else "Plan values synced across all 5 languages.")
