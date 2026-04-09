import type { Request, Response } from "express";
import handler from "../index";

export default async function adminTracksHandler(req: Request, res: Response) {
  return handler(req, res);
}
