# delete old version
rm -rf ~/Schreibtisch/monsterdex/platforms/android/app/build/outputs

# build new version (1)
#ionic cordova build android --prod --release split in two, because first one deletes www/ folder, therefore have to add it again
ng run app:ionic-cordova-build:production --platform=android

# copy db back,because www/ folder was deleted
cp /home/vanessa/Downloads/res_monsterdex/monster.db /home/vanessa/schreibtisch/monsterdex/www/monster.db

# build new version (2)
cordova build android --release

# goto directory of new version
cd ~/Schreibtisch/monsterdex/platforms/android/app/build/outputs/apk/release

# sign apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Schreibtisch/monsterdex/my-release-key.keystore app-release-unsigned.apk ionic_vanessa

ls

# rename apk
zipalign -v 4 app-release-unsigned.apk Monsterdex.apk

# install apk
adb install /home/vanessa/Schreibtisch/monsterdex/platforms/android/app/build/outputs/apk/release/Monsterdex.apk

