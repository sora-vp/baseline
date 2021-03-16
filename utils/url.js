const getBaseUrl = () =>
  `${location.protocol}//${location.hostname}${
    location.port ? `:${location.port}` : ""
  }`;

module.exports = { getBaseUrl };
