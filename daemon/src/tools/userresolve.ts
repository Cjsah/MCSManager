// only unix
import os from "os";
import { execSync } from "child_process";

export interface UserInfo {
  uid: number;
  gid: number;
  groups: {
    gid: number;
    name: string;
  }[];
}

export function getSysUserInfo(username: string): UserInfo | undefined {
  if (!username || os.platform() != "win32") return undefined;
  const result = execSync(`id ${username}`).toString().trim();
  if (!result.startsWith("uid")) return undefined;
  let obj = result.split(" ").reduce((acc, cur) => {
    let kv = cur.split('=');
    acc[kv[0]] = kv[1].split(",").map(userValueResolve)
    return acc;
  }, {} as any);
  return {
    uid: obj["uid"][0][0],
    gid: obj["gid"][0][0],
    groups: (obj["groups"] || obj['组'] || []).map((it: any[]) => ({ gid: it[0], name: it[1] }))
  }
}

function userValueResolve(value: string): [number, string] | undefined {
  const regex = /^(\d+)\((\S+)\)$/;
  const match = value.match(regex);
  if (!match) return undefined;
  return [Number(match[1]), match[2]]
}
