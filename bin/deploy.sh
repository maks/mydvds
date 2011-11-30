#!/bin/sh

cd /var/www/mydvds/app

git pull origin master
npm install
sudo restart mydvds
