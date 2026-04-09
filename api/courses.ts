import type { Request, Response } from "express";
import handler from "./index";

export default async function coursesHandler(req: Request, res: Response) {
  return handler(req, res);
}
