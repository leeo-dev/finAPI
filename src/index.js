const express = require("express");
const res = require("express/lib/response");
const { v4: uuidV4 } = require("uuid");
const app = express();
const PORT = 3000;

app.use(express.json());
const customers = [];
//Middleware
function verifyExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);
  //prettier-ignore
  if (!customer) return response.status(400).json({ error: "Customer not found!" });
  request.customer = customer;
  return next();
}

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
// app.use(verifyExistsAccountCPF);
app.get("/statement/", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

//prettier-ignore
app.listen(PORT || 5000, () => console.log(`Server is running on port ${PORT}`));
