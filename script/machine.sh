#!/bin/bash

if [ -f .data/machine.env ]; then
  echo "Machine information already exists. Skipping..."
else
  touch .data/machine.env

  echo "MACHINE_GUID=$(cat /dev/urandom | head -c 10 | base32)" >> .data/machine.env

  echo "Machine information prepared successfully."
fi