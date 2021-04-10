#!/bin/bash
cd src/
cd web-accessible-resources/
    cd js/
    echo "\"use strict\";" > script.js
    cat "../../dependencies/jquery.min.js" >> script.js
    echo "" >> script.js
    cat "../../dependencies/jquery-ui.min.js" >> script.js
    echo "" >> script.js
    cat "player/awpplayerSetup.js" >> script.js
    echo "" >> script.js
    cat "player/jwplayerSetup.js" >> script.js
    echo "" >> script.js
    cat "player/vilosplayerSetup.js" >> script.js
    echo "" >> script.js
    cat "declare.js" >> script.js
    echo "" >> script.js
    cat "embed.js" >> script.js
    echo "" >> script.js
    cat "sync.js" >> script.js
    echo "" >> script.js
    cat "events.js" >> script.js
    echo "" >> script.js
    cat "transmission.js" >> script.js
    echo "" >> script.js
    echo "undefined;" >> script.js
    echo "" >> script.js
    cd ../
    cd css
    cat "../../dependencies/jquery-ui.min.css" > script.css
    echo "" >> script.css
    cat "embed.css" >> script.css
    echo "" >> script.css