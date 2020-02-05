# delete old version
rm -rf ~/Schreibtisch/monsterdex/platforms/android/app/build

# build new version (1)
#ionic cordova build android --prod --release split in two, because first one deletes www/ folder, therefore have to add it again
ng run app:ionic-cordova-build --platform=android

# copy db back,because www/ folder was deleted
cp /home/vanessa/Downloads/res_monsterdex/monster.db /home/vanessa/schreibtisch/monsterdex/www/monster.db

# build new version (2)
cordova build android

# goto directory of new version
cd ~/Schreibtisch/monsterdex/platforms/android/app/build/outputs/apk/release

# install apk
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

