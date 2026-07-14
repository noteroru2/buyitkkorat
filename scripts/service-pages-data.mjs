import { applePages } from "./pages/apple.mjs";
import { mobilePages } from "./pages/mobile.mjs";
import { computerPages } from "./pages/computer.mjs";

export const pages = [...applePages, ...mobilePages, ...computerPages];
