STAGE=$1
DOMAIN=$2

# Check if STAGE is valid
if [[ "$STAGE" != "staging" && "$STAGE" != "production" ]]; then
  echo "Error: STAGE must be 'staging' or 'production'."
  exit 1
fi

# Check if DOMAIN is a valid FQDN
if ! [[ "$DOMAIN" =~ ^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$ ]]; then
  echo "Error: DOMAIN must be a valid FQDN (e.g., wenex.org)."
  exit 1
fi

# Check if the current branch is main
echo "Checking out to main branch..."
npm run git checkout main && echo ""

git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/client-backend.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for client-backend."
else
  git push "$STAGE" main
  echo "Remote repository for client-backend added successfully."
fi

# Navigate to the libs directory of the project
cd "libs"
git remote add "$STAGE" "git@gitlab.$DOMAIN:wenex/client-backend-libs.git"
if [ $? -ne 0 ]; then
  echo "Error: Failed to add remote repository for client-backend-libs."
else
  git push "$STAGE" main
  echo "Remote repository for client-backend-libs added successfully."
fi
