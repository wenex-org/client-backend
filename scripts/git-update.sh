if ! git remote | grep -q '^backend-template$'; then
  git remote add backend-template git@github.com:wenex-org/backend-template.git
fi

git fetch backend-template main

# Check out only the subdirectory from the remote
git checkout backend-template/main -- scripts
git checkout backend-template/main -- libs/module