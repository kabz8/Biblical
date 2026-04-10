import type { Request, Response } from "express";
import handler from "../index.js";

export default async function adminStudentsHandler(req: Request, res: Response) {
  return handler(req, res);
}
