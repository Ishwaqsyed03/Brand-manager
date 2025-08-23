# GitHub Pages Deployment Guide

This repository is configured to deploy the React frontend application to GitHub Pages.

## How it works

GitHub Pages serves the website from the root directory of the repository. The React application build files have been copied from `frontend/build/` to the root directory to enable proper deployment.

## Files for GitHub Pages

The following files in the root directory are required for GitHub Pages deployment:

- `index.html` - Main HTML file that GitHub Pages will serve
- `static/` - Directory containing all CSS and JavaScript assets
- `asset-manifest.json` - Asset manifest for the React application

## Updating the deployment

When you make changes to the React application, follow these steps to update the GitHub Pages deployment:

1. **Build the React application:**
   ```bash
   cd frontend
   npm install
   CI=false npm run build
   ```

2. **Copy build files to root:**
   ```bash
   cd ..
   cp -r frontend/build/* .
   ```

3. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Update GitHub Pages deployment"
   git push
   ```

## Important Notes

- The `.gitignore` file is configured to exclude `frontend/build/` but allow the built files in the root directory
- Always use `CI=false npm run build` to allow warnings during the build process
- GitHub Pages will automatically deploy changes when you push to the main branch
- It may take a few minutes for changes to appear on the live site

## Troubleshooting

If GitHub Pages shows the README instead of your website:
- Ensure `index.html` exists in the root directory
- Check that all files in the `static/` directory are committed
- Verify GitHub Pages is configured to serve from the root directory (not a docs folder)