#!/bin/bash

GREY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "\n[dep] ${GREY}npm install --save @ionic-native/sqlite${NC}"
npm install --save @ionic-native/sqlite

echo -e "\n[dep] ${GREY}npm install --save @ionic-native/sqlite-db-copy${NC}"
npm install -save @ionic-native/sqlite-db-copy

echo -e "\n[dep] ${GREY}npm install @ionic-native/file-path${NC}"
npm install @ionic-native/file-path

echo -e "\n[dep] ${GREY}npm install --save-dev @ionic-native/compodoc${NC}"
npm install --save-dev @compodoc/compodoc

echo -e "\n[dep] ${GREY}cordova plugin add cordova-sqlite-storage${NC}"
ionic cordova plugin add cordova-sqlite-storage

echo -e "\n[dep] ${GREY}cordova plugin add cordova-plugin-dbcopy${NC}"
ionic cordova plugin add cordova-plugin-dbcopy

echo -e "\n[dep] ${GREY}ionic cordova plugin add cordova-plugin-filepath${NC}"
ionic cordova plugin add cordova-plugin-filepath

