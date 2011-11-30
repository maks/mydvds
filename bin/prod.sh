#!/bin/sh

export PORT=8080
export BLANK_COVER_PREFIX="/var/www/mydvds.com.au/app/static/icons/blank-cover-"
node code/server.js 2>>  /var/log/nodejs/mydvds-error.log 1>> /var/log/nodejs/mydvds.log
