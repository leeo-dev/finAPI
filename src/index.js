const express = require("express");
const res = require("express/lib/response");
const { v4: uuidV4 } = require("uuid");
const app = express();
const PORT = 3000;
//https://github.com/viictorcamposs/finAPI/blob/main/src/index.js
app.use(express.json());
const customers = [
  {
    id: "a371f25d-f5e9-45dd-a28b-62a0dba31f09",
    name: "Leonardo Albuquerque",
    cpf: "05095621169",
    statement: [
      {
        description: "Ganhos",
        amount: 5000,
        createdAt: "2021-12-12",
        type: "credit",
      },
      {
        description: "Jobs",
        amount: 3000,
        createdAt: "2021-12-12",
        type: "credit",
      },
    ],
  },
];
//Middleware
function verifyExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);
  //prettier-ignore
  if (!customer) return response.status(400).json({ error: "Customer not found!" });
  request.customer = customer;
  return next();
}

function getBalance(statementArray) {
  const amount = statementArray.map((statement) => statement.amount);
  //prettier-ignore
  const balance = amount.reduce((prevValue, nextValue) => prevValue + nextValue,0);
  console.log(balance);
  return balance;
}

// app.use(verifyExistsAccountCPF);
app.post("/account", (request, response) => {
  const { name, cpf } = request.body;
  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );
  if (customerAlreadyExists)
    return response.status(400).json({ error: "Customer already exist!s" });
  const customer = { id: uuidV4(), name, cpf, statement: [] };
  customers.push(customer);
  return response.status(201).json(customer);
});
app.get("/statement/", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});
app.get("/statement/:date", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.params;
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  const formatDate = new Date(date);
  const formattedDate = formatDate.toLocaleDateString("pt-br", options);
  const statement = customer.statement.filter((statement) => {
    const statementDate = new Date(statement.createdAt);
    //prettier-ignore
    const formatStatementDate = statementDate.toLocaleDateString("pt-br", options);
    return formatStatementDate === formattedDate;
  });
  return response.json(statement);
});
app.post("/deposit", verifyExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;
  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: "credit",
  };
  customer.statement.push(statementOperation);
  return response.status(201).send();
});
app.post("/withdraw", verifyExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;
  const balance = getBalance(customer.statement);
  //prettier-ignore
  if(balance < amount) return response.status(400).json({error:"Insufficient funds."})
  const statementOperation = {
    type: "debit",
    amount: -amount,
    createdAt: new Date(),
  };
  customer.statement.push(statementOperation);
  response.status(201).json({
    statementOperation,
    success: "Successful withdrawal.",
  });
});
app.put("/account", verifyExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;
  customer.name = name;
  response.status(201).send();
});
app.get("/account", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
});
app.delete("/account", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const indexCustomer = customers.findIndex(
    (customerSystem) => customerSystem.cpf === customer.cpf
  );
  console.log(indexCustomer);
  customers.splice(indexCustomer, 1);
});
//prettier-ignore
app.listen(PORT || 5000, () => console.log(`Server is running on port ${PORT}`));
