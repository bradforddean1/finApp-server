function makeUsersArray() {
  return [
    {
      id: 1,
      username: "Steve",
      password: "Password123",
      created_at: new Date(),
    },
    {
      id: 2,
      username: "James",
      password: "Pass4321",
      created_at: new Date(),
    },
    {
      id: 3,
      username: "Sussie",
      password: "Password123MyPassword",
      created_at: new Date(),
    },
  ];
}

function makeMaliciousUser() {
  const maliciousUser = {
    id: 911,
    username: 'Naughty naughty very naughty <script>alert("xss");</script>',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    created_at: new Date(),
  };
  const expectedUser = {
    ...maliciousUser,
    username:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
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
