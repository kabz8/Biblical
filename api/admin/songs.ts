import type { Request, Response } from "express";
import handler from "../index";

export default async function adminSongsHandler(req: Request, res: Response) {
  return handler(req, res);
}
