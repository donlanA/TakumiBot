# node 版本
FROM node:20.11.1
# 建立 Container 內的資料夾
RUN mkdir -p /usr/src/bot
# 指定 Container 執行的資料夾
WORKDIR /usr/src/bot
# 複製 package.json 至執行的資料夾裡
COPY package.json /usr/src/bot
# 將所有 node js 的元件安裝起來
RUN npm install
# 複製所有檔案到執行的資料夾中
COPY . /usr/src/bot

# 指定容器內部的 Port
EXPOSE 3000

# 執行指令
CMD ["node" , "--expose-gc" , "index.js"]
