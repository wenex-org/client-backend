if ! git remote | grep -q '^backend-template$'; then
  git remote add backend-template git@github.com:wenex-org/backend-template.git
fi

git fetch backend-template main

# Check out only the subdirectory from the remote
if [ -d "$1" ]; then
  git checkout backend-template/main -- "$1"
else
  echo "Error: '$1' is not an existing directory."
  exit 1
fi