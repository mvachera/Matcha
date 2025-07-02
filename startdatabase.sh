#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

DB_CONTAINER_NAME="matchy-matchy-db"
PGADMIN_CONTAINER_NAME="matchy-matchy-pgadmin"
PGADMIN_PORT=5050
PGADMIN_EMAIL="admin@example.com"
PGADMIN_PASSWORD="admin"
NETWORK_NAME="matchy-matchy-network"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

# Create network if it doesn't exist
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
  echo "Creating docker network: $NETWORK_NAME"
  docker network create $NETWORK_NAME
fi

# Check if PostgreSQL container is running
if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
else
  if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
    docker start "$DB_CONTAINER_NAME"
    echo "Existing database container '$DB_CONTAINER_NAME' started"
  else
    # import env variables from .env
    set -a
    source .env

    DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
    DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')

    if [ "$DB_PASSWORD" = "password" ]; then
      echo "You are using the default database password"
      read -p "Should we generate a random password for you? [y/N]: " -r REPLY
      if ! [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please change the default password in the .env file and try again"
        exit 1
      fi
      # Generate a random URL-safe password
      DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
      sed -i -e "s#:password@#:$DB_PASSWORD@#" .env
    fi

    docker run -d \
      --name $DB_CONTAINER_NAME \
      --network $NETWORK_NAME \
      -e POSTGRES_USER="moha" \
      -e POSTGRES_PASSWORD="$DB_PASSWORD" \
      -e POSTGRES_DB="matchy-matchy-db" \
      -p "$DB_PORT":5432 \
      docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"

    if [ -f "schema.sql" ]; then
      echo "Applying migrations from schema.sql..."
      # Wait for PostgreSQL to start up properly
      sleep 3
      # Run psql inside the container to execute the SQL file
      docker exec -i $DB_CONTAINER_NAME psql -U moha -d matchy-matchy-db < schema.sql
      echo "Migrations applied successfully."
    else
      echo "No schema.sql file found. Skipping migrations."
    fi
  fi
fi

docker network connect $NETWORK_NAME $DB_CONTAINER_NAME

# Check if pgAdmin container is running
if [ "$(docker ps -q -f name=$PGADMIN_CONTAINER_NAME)" ]; then
  echo "pgAdmin container '$PGADMIN_CONTAINER_NAME' already running"
else
  if [ "$(docker ps -q -a -f name=$PGADMIN_CONTAINER_NAME)" ]; then
    docker start "$PGADMIN_CONTAINER_NAME"
    echo "Existing pgAdmin container '$PGADMIN_CONTAINER_NAME' started"
  else
    echo "Creating pgAdmin container..."
    docker run -d \
      --name $PGADMIN_CONTAINER_NAME \
      --network $NETWORK_NAME \
      -e PGADMIN_DEFAULT_EMAIL="$PGADMIN_EMAIL" \
      -e PGADMIN_DEFAULT_PASSWORD="$PGADMIN_PASSWORD" \
      -p "$PGADMIN_PORT":80 \
      dpage/pgadmin4

    echo "pgAdmin container '$PGADMIN_CONTAINER_NAME' was successfully created"
    echo "pgAdmin is available at: http://localhost:$PGADMIN_PORT"
    echo "Email: $PGADMIN_EMAIL"
    echo "Password: $PGADMIN_PASSWORD"
    
    echo "-------------------------------------------------------------"
    echo "To connect to your database in pgAdmin:"
    echo "1. Log in with the credentials above"
    echo "2. Right-click on 'Servers' and select 'Create > Server'"
    echo "3. Enter any name on the General tab"
    echo "4. On the Connection tab, use these settings:"
    echo "   - Host: $DB_CONTAINER_NAME"
    echo "   - Port: 5432"
    echo "   - Database: matchy-matchy-db"
    echo "   - Username: moha"
    echo "   - Password: $DB_PASSWORD"
    echo "-------------------------------------------------------------"
  fi
fi