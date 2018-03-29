#!/bin/bash

cd "$(dirname "$0")";
pwd
echo `date`: Item Update Start >> update.log
node poe_item_update.js
echo `date`: Item Update Finished >> update.log
