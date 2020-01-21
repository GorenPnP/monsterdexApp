# delete old version
rm -rf ~/Schreibtisch/monsterdex/platforms/android/app/build/outputs/apk/release/*

# build new version
ionic cordova build android --prod --release

# goto directory of new version
cd ~/Schreibtisch/monsterdex/platforms/android/app/build/outputs/apk/release

# sign apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Schreibtisch/monsterdex/my-release-key.keystore app-release-unsigned.apk ionic_vanessa

ls

# rename apk
zipalign -v 4 app-release-unsigned.apk Monsterdex.apk

# install apk
adb install /home/vanessa/Schreibtisch/monsterdex/platforms/android/app/build/outputs/apk/release/Monsterdex.apk

