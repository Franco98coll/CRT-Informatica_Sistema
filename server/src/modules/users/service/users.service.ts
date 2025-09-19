import bcrypt from "bcryptjs";
import {
  listUsers,
  updateUserPassword,
} from "../repository/users.repository.js";

export async function getUsers() {
  return listUsers();
}

export async function hashPassword(plain: string): Promise<string> {
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(plain, salt);
}

export async function setUserPassword(id: number, plain: string) {
  const hashed = await hashPassword(plain);
  await updateUserPassword(id, hashed);
  return true;
}
