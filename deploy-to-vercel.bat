@echo off
echo Deploying to Vercel...

echo Installing Vercel CLI...
npm install -g vercel

echo Setting MAX_TOKENS to 400 in the environment...
set MAX_TOKENS=400

echo Deploying to Vercel...
vercel --prod --yes

echo Done!
pause 