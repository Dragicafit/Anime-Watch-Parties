#!/bin/bash

PATH_SCRIPT_CSS="built/src/web-accessible-resources/css/"
SCRIPT_CSS="${PATH_SCRIPT_CSS}script.css"
PATH_SRC="src/web-accessible-resources/css/"

mkdir -p $PATH_SCRIPT_CSS &&
cat "src/dependencies/jquery-ui.min.css" > $SCRIPT_CSS &&
echo "" >> $SCRIPT_CSS &&
cat "${PATH_SRC}embed.css" >> $SCRIPT_CSS &&
echo "" >> $SCRIPT_CSS
