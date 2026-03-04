#!/bin/sh
set -e
if [ -z "$SPRING_DATA_MONGODB_URI" ]; then
  echo "FATAL: SPRING_DATA_MONGODB_URI is not set in environment"
  exit 1
fi
exec java $JAVA_OPTS "-Dspring.data.mongodb.uri=$SPRING_DATA_MONGODB_URI" -jar app.jar
