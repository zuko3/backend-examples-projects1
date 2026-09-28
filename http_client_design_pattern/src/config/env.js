import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 3000),
  userApiUrl:process.env.USER_API_URL || "https://jsonplaceholder.typicode.com",
  userApiTimeout:Number(process.env.USER_API_TIMEOUT) || 5000
};