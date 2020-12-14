const mergeData = (promiseArray) => {
	return Promise.all(promiseArray).then((allData) => {
		const summary = {};
		for (const dataPoint of allData) {
			Object.assign(summary, dataPoint);
		}
		return summary;
	});
};

module.exports = { mergeData };
