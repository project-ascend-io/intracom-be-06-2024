FROM mongo:latest

# Copy the keyfile and set permissions
COPY mongodb-keyfile /etc/mongodb-keyfile
RUN chmod 400 /etc/mongodb-keyfile && chown mongodb:mongodb /etc/mongodb-keyfile

# Install ping utility
RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*