"use client";

import { useEffect } from "react";

export default function ConsoleEgg() {
  useEffect(() => {
    const amber = "color:#FFC53D; font-weight:bold;";
    const dim = "color:#93A0B4;";
    const strong = "color:#FFFFFF; font-weight:bold;";
    console.log(
      "%c\n   \\ | /\n  ─ ◯ ─   %cSPOTLIGHT ON.%c\n   / | \\\n",
      amber, strong, ""
    );
    console.log(
      "%c「之を知る者は之を好む者に如かず、\n 之を好む者は之を楽しむ者に如かず」 %c— 論語\n",
      amber, dim
    );
    console.log(
      "%c知っているだけの人より、好きな人。好きな人より、楽しんでいる人にはかなわない。\n私は「楽しむ者」としてコードを書き、モノをつくる。\nそしてつくったもので、目の前の人を笑顔にする。\n",
      "color:#E8EAF0;"
    );
    console.log("%cこのソースを読みに来たあなたへ — 話しましょう。→ #contact", dim);
  }, []);

  return null;
}
