# Should I use ML?

A small browser based classifier for a question that usually deserves an argument.

Answer ten questions. It gives you a probability, a verdict, the strongest reasons for and against ML, and a mildly bureaucratic diagnosis.

The model is logistic regression. Prediction runs in the browser.

## Run

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

There are no runtime dependencies.

## Model

The model uses ten answers, each scored from 0 to 4:

- data scale
- repeated decisions
- target quality
- pattern complexity
- strength of a rule based solution
- need to generalize
- feedback loop quality
- whether SQL or a dashboard is enough
- pressure to use AI
- distribution stability

The current weights came from 9,000 simulated project cases. The simulation is in `train_model.py`.

The labels are synthetic. The score is not evidence that ML is right for a real project. It is satire with an inspectable model underneath it.

## Retrain

Install NumPy and scikit-learn, then run:

```bash
python train_model.py
```

Training output goes to `artifacts/`, which is ignored by git. If a retrained model is worth releasing, review it and replace `model.js` by hand.

## Files

- `index.html`: page
- `styles.css`: layout
- `app.js`: inference and verdicts
- `model.js`: released model weights
- `train_model.py`: fitting code
- `build_standalone.py`: makes a one file build for sharing

`standalone.html`, Python cache files, virtual environments, and training artifacts are ignored.

## Use

This is for satire, teaching, and checking whether a modelling project has a clear reason to exist.

Do not use it for consequential decisions.