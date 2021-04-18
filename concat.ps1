#!/bin/bash
cd src/
cd web-accessible-resources/
    cd css
    cat "../../dependencies/jquery-ui.min.css" > script.css
    echo "" >> script.css
    cat "embed.css" >> script.css
    echo "" >> script.css