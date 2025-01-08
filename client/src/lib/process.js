import cookie from "js-cookie";
const cookies = cookie.get("userData");
export const cooki = cookies && JSON.parse(cookies);
