import { Request, Response } from "express";
import { getUsers } from "../service/users.service.js";

export async function getAll(_req: Request, res: Response) {
  const users = await getUsers();
  res.json(users);
}
