const bcrypt = require("bcryptjs");

function makeUsersArray() {
	const salt = bcrypt.genSaltSync();
	return [
		{
			username: "steve",
			password: bcrypt.hashSync("johnson123", salt),
			created_at: new Date().toUTCString(),
		},
		{
			username: "tom",
			password: bcrypt.hashSync("xyz", salt),
			created_at: new Date().toUTCString(),
		},
		{
			username: "sandra",
			password: bcrypt.hashSync("12356789", salt),
			created_at: new Date().toUTCString(),
		},
	];
}

function makeMaliciousUser() {
	const maliciousUser = {
		username: 'Naughty naughty very naughty <script>alert("xss");</script>',
		password: 'Naughty naughty very naughty <script>alert("xss");</script>',
		created_at: new Date().toUTCString(),
	};
	const expectedUser = {
		...maliciousUser,
		username:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
		password:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
	};
	return {
		maliciousUser,
		expectedUser,
	};
}

module.exports = {
	makeUsersArray,
	makeMaliciousUser,
};
