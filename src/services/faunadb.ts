import { Client } from "faunadb";

export const fauna = new Client({
  secret: process.env.FAUNADB_API_KEY,
  domain: "db.fauna.com",
  port: 443,
  scheme: "https",
});
