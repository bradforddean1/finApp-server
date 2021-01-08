import * as Cookies from "js-cookie";

const session = {
	setSession: (session) => {
		Cookies.remove("connect.sid");
		Cookies.set("connect.sid", session, { expires: 14 });
	},

	getSession: () => {
		const sessionCookie = Cookies.get("connect.sid");

		if (sessionCookie === undefined) {
			return {};
		} else {
			return JSON.parse(sessionCookie);
		}
	},

	removeSession: () => {
		Cookies.remove("connect.sid");
	},
};

export default session;
