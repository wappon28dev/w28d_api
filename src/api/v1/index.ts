import { createHono } from "lib/constant";
import { assets } from "./assets";

export const v1 = createHono().route("/assets", assets);
