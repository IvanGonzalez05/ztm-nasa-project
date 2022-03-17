const params = {
  query: {},
  options: {
    pagination: false,
    populate: [
      {
        path: "rocket",
        select: {
          name: 1,
        },
      },
      {
        path: "payloads",
        select: {
          customers: 1,
        },
      },
    ],
  },
};

module.exports = params;
