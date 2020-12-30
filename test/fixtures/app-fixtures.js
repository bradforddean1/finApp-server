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
    "change",
    "changePct",
    "country",
    "currency",
		"current",
    "exchange",
    "finnhubIndustry",
    "ipo",
    "logo",
		"marketCapitalization",
    "name",
    "phone",
		"shareOutstanding",
		"ticker",
    "website",
    "weburl"
	];
}

function makeProfileKeysList() {
	return [
		"change",
		"changePct",
		"country",
		"currency",
		"current",
		"currentRatioAnnual",
		"currentRatioQuarterly",
		"dividendGrowthRate5Y",
		"dividendPerShare5Y",
		"dividendPerShareAnnual",
		"dividendYield5Y",
		"dividendYieldIndicatedAnnual",
		"epsBasicExclExtraItemsAnnual",
		"epsGrowth3Y",
		"epsGrowth5Y",
		"epsGrowthTTMYoy",
		"exchange",
		"finnhubIndustry",
		"ipo",
		"logo",
		"marketCapitalization",
		"name",
		"pbAnnual",
    "peNormalizedAnnual",
    "phone",
		"shareOutstanding",
    "ticker",
    "website",
		"weburl"
	];
}

module.exports = {
	makeUsersArray,
	makeMaliciousUser,
	makePortfolioItems,
	makeQuoteKeysList,
	makeProfileKeysList,
};
