#!/bin/bash
cd js
echo "\"use strict\";" > script.js
cat "dependencies/socket.io.js" >> script.js
echo "" >> script.js
cat "dependencies/jquery.min.js" >> script.js
echo "" >> script.js
cat "dependencies/jquery-ui.min.js" >> script.js
echo "" >> script.js
cat "player.js" >> script.js
echo "" >> script.js
cat "jwplayer.js" >> script.js
echo "" >> script.js
cat "vilosplayer.js" >> script.js
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
cd ..

cd css
cat "dependencies/jquery-ui.min.css" > script.css
echo "" >> script.css
cat "embed.css" >> script.css
echo "" >> script.css