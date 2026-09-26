#!/usr/bin/env python3
"""Fit the classifier used by the site."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, brier_score_loss, roc_auc_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
ARTIFACTS = ROOT / "artifacts"
SEED = 731
N = 12000

FEATURES = [
    "data_scale",
    "prediction_repetition",
    "target_quality",
    "pattern_complexity",
    "rule_solution",
    "generalization_need",
    "feedback_loop",
    "sql_sufficiency",
    "ai_pressure",
    "distribution_stability",
]


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def generate_dataset(n: int, seed: int) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    # Each feature is an ordinal answer from 0 to 4.
    X = rng.integers(0, 5, size=(n, len(FEATURES))).astype(float)

    f = {name: X[:, i] for i, name in enumerate(FEATURES)}

    # The first dataset is synthetic. Labels are sampled from this rubric.
    z = (
        -4.15
        + 0.52 * f["data_scale"]
        + 0.68 * f["prediction_repetition"]
        + 0.92 * f["target_quality"]
        + 0.58 * f["pattern_complexity"]
        - 1.02 * f["rule_solution"]
        + 0.66 * f["generalization_need"]
        + 0.34 * f["feedback_loop"]
        - 0.88 * f["sql_sufficiency"]
        - 0.44 * f["ai_pressure"]
        + 0.43 * f["distribution_stability"]
        # Interactions.
        + 0.10 * f["target_quality"] * f["prediction_repetition"]
        + 0.07 * f["data_scale"] * f["pattern_complexity"]
        - 0.11 * (4 - f["distribution_stability"]) * (4 - f["target_quality"])
    )

    # Add noise.
    z += rng.normal(0, 1.35, size=n)
    p = sigmoid(z)
    y = rng.binomial(1, p)
    return X, y


def main() -> None:
    X, y = generate_dataset(N, SEED)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=SEED, stratify=y
    )

    model = LogisticRegression(C=1.0, max_iter=2000, random_state=SEED)
    model.fit(X_train, y_train)
    p = model.predict_proba(X_test)[:, 1]
    pred = (p >= 0.5).astype(int)

    artifact = {
        "name": "should-i-use-ml-v1",
        "version": "1.0.0",
        "model_type": "logistic_regression",
        "training_data": "synthetic_project_scenarios",
        "training_rows": int(len(X_train)),
        "seed": SEED,
        "features": FEATURES,
        "intercept": float(model.intercept_[0]),
        "coefficients": {
            name: float(model.coef_[0, i]) for i, name in enumerate(FEATURES)
        },
        "metrics": {
            "holdout_rows": int(len(X_test)),
            "accuracy_0_5": float(accuracy_score(y_test, pred)),
            "roc_auc": float(roc_auc_score(y_test, p)),
            "brier": float(brier_score_loss(y_test, p)),
            "positive_rate": float(y.mean()),
        },
        "disclosure": (
            "The model was fitted to simulated project cases. The score does not tell you "
            "whether ML is right for a real project."
        ),
    }

    ARTIFACTS.mkdir(exist_ok=True)
    (ARTIFACTS / "model.json").write_text(json.dumps(artifact, indent=2) + "\n")
    (ARTIFACTS / "model.js").write_text(
        "window.SHOULD_I_USE_ML_MODEL = "
        + json.dumps(artifact, indent=2)
        + ";\n"
    )
    print(json.dumps(artifact["metrics"], indent=2))
    print("intercept", artifact["intercept"])
    print(json.dumps(artifact["coefficients"], indent=2))


if __name__ == "__main__":
    main()