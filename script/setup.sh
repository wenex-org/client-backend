#!/bin/bash

######################
# Assets Preparation #
######################

# Proto
sh ./script/machine.sh
if [ $? == 0 ]; then echo "Machine prepared successfully."
else echo "Preparing machine assets was failed...!"; fi
