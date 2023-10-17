rm IranianMarkets@ehsan.zip
zip -r IranianMarkets@ehsan.zip ./IranianMarkets@ehsan/
gnome-extensions pack ./IranianMarkets@ehsan/
gnome-extensions install -f IranianMarkets@ehsan.zip # -f is for overwrite
gnome-extensions enable IranianMarkets@ehsan
