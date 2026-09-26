# Should I use ML?

A small website that asks ten questions about a problem and estimates whether machine learning is worth trying.

The point is simple: not every problem needs ML.

## Run it

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

There are no runtime dependencies.

## What the model uses

The ten questions cover:

- how much data you have
- how often the decision is made
- whether the target is measurable
- how complicated the pattern is
- how far simple rules can get
- whether the system must handle new cases
- whether you will see outcomes later
- whether SQL or a dashboard may already solve it
- whether ML is being pushed before the problem is clear
- whether future data will look like past data

The site uses logistic regression. Prediction runs in the browser.

## Training

The first model was fitted on 9,000 simulated project examples. The labels are synthetic, so the score is not a scientific answer about whether a real project needs ML.

The useful part is the breakdown of what pushed the result up or down.

Run training with:

```bash
python train_model.py
```

Training output goes to `artifacts/`, which is ignored by git.

## Files

- `index.html` page
- `styles.css` layout
- `app.js` browser logic
- `model.js` model weights used by the site
- `train_model.py` training code
- `build_standalone.py` optional one file build

Generated files are not committed.
