@echo off
echo Initializing git repository...
git init

echo Adding all files to git...
git add .

echo Committing changes...
git commit -m "Fix: Reduce MAX_TOKENS to 400 to fix OpenRouter API credit issue"

echo Adding remote repository...
git remote add origin https://github.com/Shreyanshdiwakar/project-clay-chatbot.git

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause 