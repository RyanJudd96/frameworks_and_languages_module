FROM node
WORKDIR /app/
RUN npm install express --save
RUN npm install cors
COPY . .
CMD ["node", "server.js"]
