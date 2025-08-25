# elbowMethod

Simple frontend demo showing random 2D data and an interactive elbow plot.

How to run:

- Open `index.html` in a browser. No server required (double-click file or serve with a tiny static server).

What it does:

- Left plot: shows raw data or cluster assignments for a selected k.
- Right plot: elbow plot of inertia vs k. Click any point on the elbow plot to show clusters for that k on the left.

Files:

- `index.html` - main page
- `styles.css` - basic styles
- `script.js` - data, kmeans, plotting logic

Notes:

- Uses Plotly CDN for plotting. No frameworks.
- Simple, readable KMeans implementation intended for demos and learning.

Troubleshooting:

- If Plotly fails to load due to network restrictions, download a local copy of Plotly and update the script src in `index.html`.
# elbowMethod