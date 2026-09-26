// Model used by the site. See train_model.py for the fitting code.
window.SHOULD_I_USE_ML_MODEL = {
  "name": "should-i-use-ml-v1",
  "version": "1.0.0",
  "model_type": "logistic_regression",
  "training_data": "synthetic_project_scenarios",
  "training_rows": 9000,
  "seed": 731,
  "features": [
    "data_scale",
    "prediction_repetition",
    "target_quality",
    "pattern_complexity",
    "rule_solution",
    "generalization_need",
    "feedback_loop",
    "sql_sufficiency",
    "ai_pressure",
    "distribution_stability"
  ],
  "intercept": -4.722181718194564,
  "coefficients": {
    "data_scale": 0.5118901281249142,
    "prediction_repetition": 0.6692842964069381,
    "target_quality": 1.0368617840496737,
    "pattern_complexity": 0.5137238901371032,
    "rule_solution": -0.7821531797350054,
    "generalization_need": 0.5059162675137092,
    "feedback_loop": 0.2727848014702681,
    "sql_sufficiency": -0.6792916416440794,
    "ai_pressure": -0.3497267826980153,
    "distribution_stability": 0.5065761637469219
  },
  "metrics": {
    "holdout_rows": 3000,
    "accuracy_0_5": 0.8373333333333334,
    "roc_auc": 0.9148762442133249,
    "brier": 0.11686118349092131,
    "positive_rate": 0.4645
  },
  "disclosure": "The model was fitted to simulated project cases. The score does not tell you whether ML is right for a real project."
};