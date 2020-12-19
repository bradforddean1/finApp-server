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

function makePortfolioItems() {
	return [
		{
			user_id: "1",
			ticker: "AAPL",
		},
		{
			user_id: "1",
			ticker: "TSLA",
		},
		{
			user_id: "1",
			ticker: "FUN",
		},
	];
}

function makeQuoteKeysList() {
	return [
		"current",
		"change",
		"changePct",
		"country",
		"currency",
		"exchange",
		"ipo",
		"marketCapitalization",
		"name",
		"shareOutstanding",
		"ticker",
		"website",
		"logo",
		"finnhubIndustry",
	];
}

function makeProfileKeysList() {
	return [
		"current",
		"change",
		"changePct",
		"peNormalizedAnnual",
		"pbAnnual",
		"dividendPerShareAnnual",
		"dividendYieldIndicatedAnnual",
		"dividendPerShare5Y",
		"dividendYield5Y",
		"dividendGrowthRate5Y",
		"epsBasicExclExtraItemsAnnual",
		"epsGrowth3Y",
		"epsGrowth5Y",
		"epsGrowthTTMYoy",
		"currentRatioAnnual",
		"currentRatioQuarterly",
		"country",
		"currency",
		"exchange",
		"ipo",
		"marketCapitalization",
		"name",
		"shareOutstanding",
		"ticker",
		"weburl",
		"logo",
		"finnhubIndustry",
		"chartData",
	];
}

module.exports = {
	makeUsersArray,
	makeMaliciousUser,
	makePortfolioItems,
	makeQuoteKeysList,
	makeProfileKeysList,
};
