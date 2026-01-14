const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "X-API-Key":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhlNTk0NDE0LTg3NGMtNDZlMC1iMWNlLWU5ZjYzMjY1YWExMiIsIm9yZ0lkIjoiNDI2Nzk1IiwidXNlcklkIjoiNDM4OTk2IiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiI2YzMwMDY3Yi1kNDEyLTQwYjYtYTQ4OS0zYjEwM2ExNThjOGMiLCJpYXQiOjE3Mzc0NTA4NzcsImV4cCI6NDg5MzIxMDg3N30.pd8sKdRHdtlqoZVS7wb8Jyy2GLhhr95X8yW64W_gSC0",
  },
};

fetch(
  "https://deep-index.moralis.io/api/v2.2/wallets/0xcaA141ece9fEE66D15f0257F5c6C48E26784345C/tokens?limit=200",
  options,
)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(err));
