#!/bin/bash

cd "$(dirname "$0")";
pwd
echo `date`: League Update Start  >> update.log
node poe_leagues_update.js
echo `date`: League Update End >> update.log
echo `date`: Ladder Update Start >> update.log
node poe_ladder_update.js
echo `date`: Ladder Update End >> update.log

