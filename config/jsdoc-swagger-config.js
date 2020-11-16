const options = {
	info: {
		version: "1.0.0",
		title: "Albums store",
		license: {
			name: "MIT",
		},
	},
	security: {
		BasicAuth: {
			type: "http",
			scheme: "basic",
		},
	},
	filesPattern: "./**/*.js", // Glob pattern to find your jsdoc files
	swaggerUIPath: "/api-docs", // SwaggerUI will be render in this url. Default: '/api-docs'
	baseDir: __dirname,
};

module.exports = options;
