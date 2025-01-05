#!/bin/bash

######################
# Assets Preparation #
######################

# Machine
bash ./scripts/machine.sh
if [ $? == 0 ]; then echo -e "Machine prepared successfully.\n"
else echo -e "Preparing machine assets was failed...!\n" && exit 1; fi
