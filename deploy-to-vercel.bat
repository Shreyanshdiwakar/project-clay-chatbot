@echo off
echo Deploying to Vercel...

echo Installing Vercel CLI...
npm install -g vercel

echo Setting environment variables...
set MAX_TOKENS=400

echo:
echo Please enter your OpenRouter API key:
set /p OPENROUTER_API_KEY=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

echo:
echo Deploying to Vercel with environment variables...
vercel --prod --yes -e OPENROUTER_API_KEY=%OPENROUTER_API_KEY%

echo Done!
pause 