#!/bin/bash -
set -o nounset                                  # Treat unset variables as an error
BASE_DIR=`dirname $0`/..
cd $BASE_DIR
tree -I "listing|scripts|*.js|itworks.jpg|index.html" -H .. |
  sed -z 's/<p class="VERSION">.*<\/p>//' > listing/index.html
