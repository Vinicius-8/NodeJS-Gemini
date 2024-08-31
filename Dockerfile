# Use a imagem Node.js oficial como base
FROM node:18

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie o package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código
COPY . .

# Compile o código TypeScript
RUN npm run build

# Exponha a porta onde o app estará escutando
EXPOSE 3000

# Execute as migrações e inicie a aplicação
CMD ["sh", "-c", "npm run migrate && npm start"]