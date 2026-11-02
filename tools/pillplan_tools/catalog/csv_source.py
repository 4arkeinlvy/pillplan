"""Reads the human-edited CSV files in data-src/ into a validated Catalog."""

import csv
from collections.abc import Iterator
from pathlib import Path

from .models import Catalog, Drug, Ingredient, WarningLabel

LIST_SEPARATOR = ";"
COMBINATION_SEPARATOR = "+"
PRN = "prn"


def read_catalog(source_dir: Path) -> Catalog:
    """Load warnings, ingredients and drugs from `source_dir` and validate them together."""
    warnings = [WarningLabel.model_validate(row) for row in _rows(source_dir / "warnings.csv")]
    ingredients = [_ingredient(row) for row in _rows(source_dir / "ingredients.csv")]
    drugs = [_drug(row) for row in _rows(source_dir / "drugs.csv")]
    return Catalog(
        warnings=tuple(sorted(warnings, key=lambda w: w.id)),
        ingredients=tuple(sorted(ingredients, key=lambda i: i.id)),
        drugs=tuple(sorted(drugs, key=lambda d: d.name.lower())),
    )


def _rows(path: Path) -> Iterator[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        for line_number, row in enumerate(csv.DictReader(handle), start=2):
            if None in row:
                raise ValueError(f"{path.name}:{line_number}: too many columns")
            yield {key: (value or "").strip() for key, value in row.items()}


def _split(value: str, separator: str = LIST_SEPARATOR) -> tuple[str, ...]:
    return tuple(part.strip() for part in value.split(separator) if part.strip())


def _ingredient(row: dict[str, str]) -> Ingredient:
    limit = row["usual_max_daily"]
    return Ingredient.model_validate({**row, "usual_max_daily": float(limit) if limit else None})


def _drug(row: dict[str, str]) -> Drug:
    times = _split(row["default_times"])
    prn = times == (PRN,)
    strengths = tuple(
        tuple(float(amount) for amount in _split(option, COMBINATION_SEPARATOR))
        for option in _split(row["strengths"])
    )
    return Drug.model_validate(
        {
            **row,
            "brands": _split(row["brands"]),
            "ingredients": _split(row["ingredients"]),
            "strengths": strengths,
            "default_times": () if prn else times,
            "default_prn": prn,
            "best_times": _split(row["best_times"]),
            "warnings": _split(row["warnings"]),
        }
    )
