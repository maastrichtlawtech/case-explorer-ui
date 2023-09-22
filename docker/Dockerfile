# Use the official Node.js 16 base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY ./yarn.lock ./package.json /app/

# Install Expo CLI globally
RUN yarn global add expo-cli@4.13

# Install project dependencies using yarn
RUN yarn 

# Copy the entire project to the container
COPY . /app/

# Expose the necessary port for the web app (replace with your app's port)
EXPOSE 19006

# Start the web app
CMD ["npm", "start"]